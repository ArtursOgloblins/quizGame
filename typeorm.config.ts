import { config } from 'dotenv';
import {DataSource, DataSourceOptions} from 'typeorm';

config();

const environments = {
  development: {
    url: process.env.DATABASE_URL,
    type: 'postgres',
    migrations: ['migrations/dev/*.ts'],
    entities: ['src/**/*.entity.ts'],
  },
  test: {
    url: process.env.DATABASE_URL_TEST,
    type: 'postgres',
    migrations: ['migrations/test/*.ts'],
    entities: ['src/**/*.entity.ts'],
  },
  production: {
    url: process.env.DATABASE_URL,
    type: 'postgres',
    migrations: ['dist/migrations/*.js'],  // Компилированные файлы для production
    entities: ['dist/**/*.entity.js'],
  },
};

// Функция для получения конфигурации базы данных в зависимости от текущей среды
export const getDataSourceOptions = (): DataSourceOptions => {
  const currentEnvironment = process.env.NODE_ENV || 'development';
  return environments[currentEnvironment];
};

// Инициализация и экспорт DataSource с использованием конфигурации
const dataSourceOptions: DataSourceOptions = getDataSourceOptions();
export default new DataSource(dataSourceOptions);


