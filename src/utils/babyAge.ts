type TFn = (key: string, vars?: Record<string, string | number>) => string;

/** Home card age (uses `home.age*` keys). */
export function formatBabyAge(dob: string, t: TFn): string {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const days = Math.floor((Date.now() - birth.getTime()) / 86400000);
  if (days < 0) return t('home.ageFuture');
  if (days === 0) return t('home.ageNewborn');
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);
  if (days < 7) return t('home.ageDays', { n: days });
  if (days < 30) return t('home.ageWeeks', { n: Math.floor(days / 7) });
  if (years < 1) {
    const remWeeks = Math.floor((days - months * 30.44) / 7);
    return remWeeks > 0
      ? t('home.ageMonthsWeeks', { m: months, w: remWeeks })
      : t('home.ageMonths', { n: months });
  }
  const remMonths = months - years * 12;
  return remMonths > 0
    ? t('home.ageYearsMonths', { y: years, m: remMonths })
    : t('home.ageYears', { y: years });
}

/** Baby list row age (uses `babies.list*` keys). */
export function formatListBabyAge(dob: string, t: TFn): string {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const now = new Date();
  const days = Math.floor((now.getTime() - birth.getTime()) / 86400000);
  if (days < 0) return t('babies.listFuture');
  if (days === 0) return t('babies.listNewborn');
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);
  if (days < 7) return days === 1 ? t('babies.listAgeDay', { n: days }) : t('babies.listAgeDays', { n: days });
  if (days < 30) {
    const w = Math.floor(days / 7);
    return w === 1 ? t('babies.listAgeWeek', { n: w }) : t('babies.listAgeWeeks', { n: w });
  }
  if (years < 1) {
    const remWeeks = Math.floor((days - months * 30.44) / 7);
    return remWeeks > 0
      ? t('babies.listAgeMonthsWeeks', { m: months, w: remWeeks })
      : months === 1
        ? t('babies.listAgeMonth', { n: months })
        : t('babies.listAgeMonths', { n: months });
  }
  const remMonths = months - years * 12;
  return remMonths > 0 ? t('babies.listAgeYears', { y: years, m: remMonths }) : t('babies.listAgeYear', { y: years });
}

/** Profile / detail short age (uses `babyDetail.age*` keys). */
export function formatDetailBabyAge(dob: string, t: TFn): string {
  const diff = Date.now() - new Date(dob).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30) return days === 1 ? t('babyDetail.ageDaysOne', { n: days }) : t('babyDetail.ageDays', { n: days });
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? t('babyDetail.ageMonthOne', { n: months }) : t('babyDetail.ageMonths', { n: months });
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0
    ? t('babyDetail.ageYearsMonths', { y: years, m: rem })
    : years === 1
      ? t('babyDetail.ageYearOne', { y: years })
      : t('babyDetail.ageYears', { y: years });
}
