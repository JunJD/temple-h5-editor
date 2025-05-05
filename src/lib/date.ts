import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd', { locale: zhCN });
}

export function formatDateTime(date: Date | string | number): string {
  const timeZone = 'Asia/Shanghai';
  try {
    return formatInTimeZone(date, timeZone, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
  } catch (error) {
    try {
      return format(new Date(date), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
    } catch (fallbackError) {
      return 'Invalid Date';
    }
  }
}