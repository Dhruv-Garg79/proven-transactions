import { SafeParseError, ZodObject } from 'zod';
import Postgres from '../../config/postgres';
import Logger from '../../utils/logger';
import Result from '../../utils/result';

type Operators = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'ilike';
type ValueTypes = string | number | boolean | Date;
type WhereFilter<T> = {
	[field in keyof T]: ValueTypes | null;
};

type ExtendedWhereFilter<T> = {
	[field in keyof T]: {
		[operator in Operators]?: ValueTypes;
	};
};

export default class BaseTable<T> {
	protected logger: Logger;
	protected postgres = Postgres.getInstance();
	protected tableName: string;
	protected schema: ZodObject<any>;
	protected primaryKey: string;

	constructor(namespace: string, tableName: string, schema: ZodObject<any>, primaryKey?: keyof T) {
		this.logger = new Logger(namespace);
		this.tableName = tableName;
		this.schema = schema;
		this.primaryKey = (primaryKey as string) ?? 'id';
	}

	protected validate(fields: T): Result<boolean> {
		try {
			const result = this.schema.deepPartial().safeParse(fields);
			if (!result.success) {
				const failResult = result as SafeParseError<T>;
				throw new Error(`Validation Failed : ${JSON.stringify(failResult.error)}`);
			}
			return new Result(true);
		} catch (err) {
			this.logger.error('Validation Failed, ' + err.message);
			throw new Error(err.message);
		}
	}

	public async getRows(p: {
		where?: WhereFilter<T>;
		order?: { by: keyof T; order: 'asc' | 'desc' };
		limit?: number;
		offset?: number;
		fields?: Array<keyof T>;
	}): Promise<Result<Array<T>>> {
		try {
			let { query, values } = this.whereClause(p.where);

			if (p.order) query += ` ORDER BY "${p.order.by as string}" ${p.order.order}`;
			if (p.limit) query += ` LIMIT ${p.limit}`;
			if (p.offset) query += ` OFFSET ${p.offset}`;

			const fields = p.fields ? p.fields.map(item => `"${item as any}"`).join(', ') : '*';

			const statement = `SELECT ${fields} FROM ${this.tableName}` + query;
			const result = await this.postgres.pgClient.query(statement, values);
			return new Result(result.rows);
		} catch (err) {
			this.logger.error(err.message);
			return Result.error(err.message);
		}
	}

	public async getRowsExtended(p: {
		where?: ExtendedWhereFilter<T>;
		order?: { by: keyof T; order: 'asc' | 'desc' };
		limit?: number;
		offset?: number;
		fields?: Array<keyof T>;
	}): Promise<Result<Array<T>>> {
		try {
			let { query, values } = this.whereClauseExtended(p.where);

			if (p.order) query += ` ORDER BY "${p.order.by as string}" ${p.order.order}`;
			if (p.limit) query += ` LIMIT ${p.limit}`;
			if (p.offset) query += ` OFFSET ${p.offset}`;

			const fields = p.fields ? p.fields.map(item => `"${item as any}"`).join(', ') : '*';

			const statement = `SELECT ${fields} FROM ${this.tableName}` + query;
			const result = await this.postgres.pgClient.query(statement, values);
			return new Result(result.rows);
		} catch (err) {
			this.logger.error(err.message);
			return Result.error(err.message);
		}
	}

	public async getCount(where?: WhereFilter<T>): Promise<Result<number>> {
		try {
			const { query, values } = this.whereClause(where);

			const statement = `SELECT count("${this.primaryKey}") FROM ${this.tableName}` + query;
			const { rows } = await this.postgres.pgClient.query(statement, values);

			return new Result(rows.length > 0 ? Number(rows[0].count) : 0);
		} catch (err) {
			this.logger.error(err.message);
			return Result.error(err.message);
		}
	}

	public async getRowById(id: string): Promise<Result<T>> {
		this.logger.debug('getRowById Params: ', id);
		try {
			const statement = `SELECT * FROM ${this.tableName} WHERE "${this.primaryKey}" = $1`;
			const result = await this.postgres.pgClient.query(statement, [id]);
			return new Result(result.rows[0]);
		} catch (err) {
			this.logger.error(err.message);
			return Result.error(err.message);
		}
	}

	public async addRow(fields: T): Promise<Result<T>> {
		try {
			const { error: validateErr } = this.validate(fields);
			if (validateErr) return Result.error(validateErr);

			const values = Object.values(fields);
			const updateFields = Object.keys(fields)
				.map((item, _) => `"${item}"`)
				.join(', ');
			const valuesQuery = Object.keys(fields)
				.map((_, index) => `$${index + 1}`)
				.join(', ');
			const statement = `INSERT INTO ${this.tableName} (${updateFields}) VALUES (${valuesQuery}) RETURNING *`;
			const result = await this.postgres.pgClient.query(statement, [...values]);
			const addedTuple = result.rows[0];
			return new Result(addedTuple);
		} catch (err) {
			this.logger.error(err.message);
			return Result.error(err.message);
		}
	}

	// the max limit of parameters in a query is 65535
	public async addRows(array: Array<T>): Promise<Result<Array<string>>> {
		const n = array.length;
		if (n === 0) return Result.error('no data passed for insertion');

		try {
			const fields = Object.keys(array[0])
				.map(item => `"${item as any}"`)
				.join(', ');

			let i = 0;
			const values = [];
			const indexVals = [];
			for (const item of array) {
				const idxs = [];
				// eslint-disable-next-line no-loop-func
				Object.values(item).forEach(val => {
					i++;
					idxs.push('$' + i);
					values.push(val);
				});
				indexVals.push('(' + idxs.join(',') + ')');
			}

			const statement = `INSERT INTO ${this.tableName} (${fields}) VALUES ${indexVals.join(',')} RETURNING "${
				this.primaryKey
			}"`;

			const result = await this.postgres.pgClient.query(statement, values);
			return new Result(result.rows.map(item => item[this.primaryKey]));
		} catch (err) {
			this.logger.error(err.message);
			return Result.error(err.message);
		}
	}

	public async updateRow(id: string, fields: T): Promise<Result<T>> {
		this.logger.debug(`Updating Row`, id, fields);
		try {
			const { error: validateErr } = this.validate(fields);
			if (validateErr) return Result.error(validateErr);

			const values = Object.values(fields);
			const updateQuery = Object.keys(fields)
				.map((item, index) => `"${item}" = $${index + 2}`)
				.join(', ');
			const statement = `UPDATE ${this.tableName} SET ${updateQuery} WHERE "${this.primaryKey}" = $1 RETURNING *`;
			const result = await this.postgres.pgClient.query(statement, [id, ...values]);
			const updatedRow = result.rows[0];
			return new Result(updatedRow);
		} catch (err) {
			this.logger.error(err.message);
			return Result.error(err.message);
		}
	}

	public async deleteById(id: string): Promise<Result<T>> {
		this.logger.debug(`Deleting Row`, id);
		try {
			const result = await this.postgres.pgClient.query(
				`DELETE FROM ${this.tableName} WHERE "${this.primaryKey}" = $1 RETURNING *`,
				[id],
			);
			this.logger.debug('Delete Result', result);
			const deletedRow = result.rows[0];
			return new Result(deletedRow);
		} catch (err) {
			this.logger.error(err.message);
			return Result.error(err.message);
		}
	}

	public async delete(p: { where: ExtendedWhereFilter<T>; limit?: number }): Promise<Result<number>> {
		try {
			let { query, values } = this.whereClauseExtended(p.where);

			if (p.limit) query += ` LIMIT ${p.limit}`;

			const result = await this.postgres.pgClient.query(`DELETE FROM ${this.tableName}` + query, values);
			return new Result(result.rowCount);
		} catch (err) {
			this.logger.error(err.message);
			return Result.error(err.message);
		}
	}

	protected whereClause(where?: WhereFilter<T>): { query: string; values: any[] } {
		if (!where) return { query: '', values: [] };

		let query = ' WHERE ';
		const values = [];

		Object.keys(where).forEach(key => {
			const value = where[key];

			if (value === null) {
				query += `"${key}" is NULL and `;
			} else {
				query += `"${key}" = $${values.length + 1} and `;
				values.push(value);
			}
		});

		query = query.slice(0, -5);
		return { query, values };
	}

	protected whereClauseExtended(where?: ExtendedWhereFilter<T>): { query: string; values: any[] } {
		if (!where) return { query: '', values: [] };

		let query = ' WHERE ';
		const values = [];

		Object.keys(where).forEach(key => {
			Object.keys(where[key]).forEach(operator => {
				const value = where[key][operator];

				query += `"${key}" ${operator} $${values.length + 1} and `;
				values.push(value);
			});
		});

		query = query.slice(0, -5);
		return { query, values };
	}
}
