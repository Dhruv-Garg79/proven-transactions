export default class DateHelper {
	public static addHours(date: Date, hours: number) {
		date.setTime(date.getTime() + hours * 60 * 60 * 1000);
	}

	public static addDays(date: Date, days: number): Date {
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		return date;
	}
}
