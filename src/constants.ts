const MONTHS = ["YANVAR", "FEVRAL", "MART", "APREL", "MAY", "IYUN", "IYUL", "AVGUST", "SENTABR", "OKTABR", "NOYABR", "DEKABR"];

const now = new Date();
export const TODAY = `${now.getDate()} ${MONTHS[now.getMonth()]}`;

/** Kashf etish sahifasidagi filtrlar. */
export const FILTER_CATEGORIES = ["Barchasi", "Hayot", "Psixologiya", "Biznes", "Falsafa", "Jamiyat", "Tafakkur"];

/** Yangi fikr yozishdagi yo‘nalishlar (backend CATEGORIES bilan bir xil). */
export const COMPOSER_CATEGORIES = ["TAFAKKUR", "HAYOT", "JAMIYAT", "FALSAFA", "PSIXOLOGIYA", "BIZNES"];

export const MAX_COVER_BYTES = 5 * 1024 * 1024;
