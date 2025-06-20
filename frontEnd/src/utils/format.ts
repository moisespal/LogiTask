export const formatDateLocal = (dateString: string, timeZone: string): string => {
    if (!dateString) return "No date available";
    
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timeZone,
      year: "numeric",
      month: "short",
      day: "numeric",
    };
  
  return date.toLocaleDateString("en-US", options);
}

export const formatDayOfTheWeek = (dateString: string, timeZone: string): string => {
    if (!dateString) return "No date available";
    
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
  
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      timeZone: timeZone,
    };
  return date.toLocaleDateString("en-US", options);
};

export const daysUntilNextJob = (nextDate: string, timeZone: string): {days: number, text: string} => {
  const todayStr = getTodayInUserTimezone(timeZone);
  const today = new Date(`${todayStr}T00:00:00`);
  const nextServiceDate = new Date(`${nextDate}T00:00:00`);
  
  const daysDiff = nextServiceDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(daysDiff / (1000 * 3600 * 24) + 0);

  if (daysUntil === 0) return { days: 0, text: "Today" };
  if (daysUntil === 1) return { days: 1, text: "Tomorrow" };
  return { days: daysUntil, text: `${daysUntil} days` };
};

export const getTodayInUserTimezone = (timeZone: string): string => {

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.formatToParts(now);
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;
    const year = parts.find(part => part.type === 'year')?.value;

    return `${year}-${month}-${day}`;
}

export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "N/A";
    
    const options: Intl.NumberFormatOptions = {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };
    
    return new Intl.NumberFormat("en-US", options).format(amount);
}

