import axios from 'axios';

export const WORDPRESS_API = {
  BASE_URL: 'https://vicere.com.br',
  WC_API: '/wc/v2',
  JWT_AUTH: '?rest_route=/simple-jwt-login/v1',
  CONSUMER_KEY: 'ck_f80548da3a437dbbe085829108e755d18d157748',
  CONSUMER_SECRET: 'cs_2d9691a92e8b9394dc48f107f90e8237b9c4b23a',
};

export const api = axios.create({
  baseURL: WORDPRESS_API.BASE_URL,
  timeout: 30000,
});

export const wcApi = axios.create({
  baseURL: `${WORDPRESS_API.BASE_URL}${WORDPRESS_API.WC_API}`,
  timeout: 30000,
  auth: {
    username: WORDPRESS_API.CONSUMER_KEY,
    password: WORDPRESS_API.CONSUMER_SECRET
  }
});