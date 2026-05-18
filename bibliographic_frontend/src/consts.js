// src/consts.js
export const BACKEND_PORT = 8080;
export const FRONTEND_PORT = 3000;
export const HOST = 'localhost';

export const REF_FORM_MULTYROW_URL = `http://${HOST}:${BACKEND_PORT}/api/requestMultyRow`;
export const SEARCH_ELIBRARY_URL = `http://${HOST}:${BACKEND_PORT}/api/search_elibrary`;


// Определяем константы типов библиографических ссылок

export const bibl_type_book = "Книга"
export const bibl_type_internet_resourse = "Интернет-ресурс"
export const bibl_type_law = "Закон, нормативный акт и т.п."
export const bibl_type_dissertation = "Диссертация"
export const bibl_type_autodissertation = "Автореферат"
export const bibl_type_journal_article = "Статья из журнала"
export const bibl_type_article_from_the_collection = "Статья из сборника"
export const bibl_type_article_from_the_newspaper = "Статья из газеты"
export const bibl_type_custom_type = "Другой" // используется вместе с примером оформления от пользователя
