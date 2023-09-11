from os import listdir
from time import time
from typing import Dict

import requests

from models import StocksInterface, Cached, is_company_valid, range_range, range_intervals


class StocksProxy(StocksInterface):
    """
    Валидируется разрешённые компании для запросов и кэширует данные
    """

    def __init__(self, stocks_api, cache_time, valid_companies):
        self.stocks_api = stocks_api
        self.cache_time = cache_time  # in seconds
        self.valid_companies = valid_companies

        self.cached_info: Dict[str, Cached] = {}
        self.cached_top: Cached = None

        self.company_files = [file.split('.')[0] for file in listdir('about')]

    @is_company_valid
    def get_company_info(self, short_name):
        """
        Кеширует запросы на получение детальной информации о компании 
        """
        if (short_name in self.cached_info) and self.is_cache_valid(self.cached_info[short_name]):
            return self.cached_info[short_name].cached_value

        self.stocks_api.fetch_companies()

        value = self.stocks_api.get_company_info(short_name)
        self.cached_info[short_name] = Cached(value, time())

        return value

    def get_all_companies(self):
        if (self.cached_top is not None) and self.is_cache_valid(self.cached_top):
            return self.cached_top.cached_value

        self.stocks_api.fetch_companies()

        value = self.stocks_api.get_all_companies()
        value = [company for company in value if company['short_name'] in self.valid_companies]

        self.cached_top = Cached(value, time())

        return value

    @is_company_valid
    def get_about_company(self, short_name):

        with open(f'about/{short_name}.txt', 'r') as file:
            return {'about': ''.join(file.readlines())}

    @is_company_valid
    def get_chart_data(self, short_name, data_range):
        yahoo_api_range = range_range[data_range]
        yahoo_api_inteval = range_intervals[yahoo_api_range]

        data = requests.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{short_name}?region=US&lang=en-US&includePrePost=false&interval={yahoo_api_inteval}&range={yahoo_api_range}&corsDomain=finance.yahoo.com&.tsrc=finance").json()

        if data['chart']['error'] is None:
            close_prices = data['chart']['result'][0]['indicators']['quote'][0]['close']
            timestamps = data['chart']['result'][0]['timestamp']
            data = [{"value": pair[0], "timestamp": pair[1]} for pair in zip(close_prices, timestamps) if
                    None not in pair]

            return data

        raise HTTPException(status_code=404, detail="One of parametrs is missing or invalid")
