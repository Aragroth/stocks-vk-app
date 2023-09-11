import re
from time import time
from typing import Dict

import pandas as pd
import requests

from models import StocksInterface, Cached


class StocksAPI(StocksInterface):

    def __init__(self, spreadsheet_url, file_location, cache_time):
        self.stocks_url = spreadsheet_url
        self.file_location = file_location
        self.stocks_df = pd.DataFrame()

        self.xchange_session = requests.Session()
        self.xchange_session.get("https://calculator888.ru")

        self.cached_currency: Dict[str, Cached] = {}
        self.cache_time = cache_time

    def fetch_companies(self):
        """
        Синхронизируется с данными, которые получает из гугл-таблицы
        с лидерами автопрома по капатилизации
        """
        response = requests.get(self.stocks_url)

        with open(self.file_location, 'wb') as file:
            file.write(response.content)

        column_names = ["name", "capitalization", "change", 'short_name', "current_price", "currency"]
        used_columns_num = [3, 4, 6, 7, 8, 9]
        converters = {
            'change': lambda x: '+' + x.strip()[:-1] if not x.startswith(
                '-') else '0.00' if x.strip() == '-' else x.strip()[:-1],
            'name': lambda x: x.replace('*', ''),
            'capitalization': lambda x: x.strip()
        }

        self.stocks_df = pd.read_csv(
            self.file_location, delimiter=',',
            skiprows=4, index_col=3, names=column_names,
            usecols=used_columns_num, converters=converters
        ).dropna()

    def get_all_companies(self):
        companies_data = []

        for short_name in self.stocks_df.index:
            companies_data.append(
                self.get_company_info(short_name)
            )

        return companies_data

    def get_company_info(self, short_name):
        """
        Возвращает информацию об одной компании
        по её короткому идентификатору биржи
        """
        stock_information = self.stocks_df.loc[short_name].to_dict()
        stock_information.update({"short_name": short_name})

        # убираем значок 🔋
        clear_name = ' '.join([word for word in stock_information['name'].split() if word != '🔋'])
        stock_information['name'] = clear_name

        for category in ['current_price', 'capitalization']:
            stock_information[category] = float(stock_information[category].replace(',', ''))

        xchange = 1
        if stock_information['currency'] != 'USD':
            xchange = self.get_currency_xchange(stock_information['currency'])

        stock_information['current_price'] = stock_information['current_price'] * xchange
        return stock_information

    def get_currency_xchange(self, currency_code):
        if (currency_code in self.cached_currency) and self.is_cache_valid(self.cached_currency[currency_code]):
            return self.cached_currency[currency_code].cached_value

        r = self.xchange_session.get(
            f"https://calculator888.ru/aj/konv_val/kurs_brza_kray_aj.php?vl_1={currency_code}&vl_2=USD")
        xchange = float(re.findall(r',\[".+?", ([\d\.]+?)\]', r.text)[1])

        self.cached_currency[currency_code] = Cached(xchange, time())

        return xchange
