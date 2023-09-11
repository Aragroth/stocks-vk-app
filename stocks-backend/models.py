from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from time import time
from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel


@dataclass
class Cached:
    cached_value: Any
    cached_at: int


def is_company_valid(method):
    def wrapper(self, *args, **kwargs):
        if 'short_name' in kwargs:
            short_name = kwargs['short_name']
        else:
            short_name = args[0]

        if short_name not in self.valid_companies + self.company_files:
            raise HTTPException(status_code=404, detail="No information about this company")

        return method(self, *args, **kwargs)

    return wrapper


class StocksInterface(ABC):
    @abstractmethod
    def get_company_info(self, short_name):
        pass

    @abstractmethod
    def get_all_companies(self):
        pass

    def is_cache_valid(self, cache_object):
        return time() - cache_object.cached_at < self.cache_time


class Point(BaseModel):
    value: float
    timestamp: int


class Ranges(str, Enum):
    last_day = 'day'
    last_month = 'month'
    last_year = 'year'
    maximum = 'max'


class Company(BaseModel):
    name: str
    short_name: str
    capitalization: float
    current_price: float
    change: float


class SortBy(str, Enum):
    capitalization = 'capitalization'
    cost = 'cost'
    change = 'change'


range_intervals = {'1d': '2m', '1mo': '1d', '1y': '5d', 'max': '3mo'}
range_range = {Ranges.last_day: '1d', Ranges.last_month: '1mo', Ranges.last_year: '1y', Ranges.maximum: 'max'}

companies_to_watch = [
    'TSLA',
    'TM',
    'VOW.DE',
    'DAI.DE',
    'RACE',
    'HMC',
    'BMW.DE',
    'GM',
    '005380.KS',
    '600104.SS',
    '1211.HK',
    'MARUTI.NS',
    'F',
    'FCAU',
    '0175.HK',
    'SZKMF',
    'NIO',
    'FUJHY',
    'UG.PA',
    'NSANY',
    'NKLA',
    'M&M.NS',
    '000800.SZ',
    'RNO.PA',
    '000625.SZ',
]
