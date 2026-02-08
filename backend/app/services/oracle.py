import os
from dataclasses import dataclass
from web3 import Web3


CHAINLINK_FEEDS = {
    "ETH/USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    "BTC/USD": "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
    "LINK/USD": "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
}

AGGREGATOR_ABI = [
    {
        "inputs": [],
        "name": "latestRoundData",
        "outputs": [
            {"internalType": "uint80", "name": "roundId", "type": "uint80"},
            {"internalType": "int256", "name": "answer", "type": "int256"},
            {"internalType": "uint256", "name": "startedAt", "type": "uint256"},
            {"internalType": "uint256", "name": "updatedAt", "type": "uint256"},
            {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function",
    },
]


@dataclass
class OracleResult:
    value: float
    updated_at: int


def _get_provider_url() -> str:
    return os.getenv("WEB3_PROVIDER_URL", "https://cloudflare-eth.com")


def _get_web3() -> Web3:
    return Web3(Web3.HTTPProvider(_get_provider_url()))


def get_provider_label() -> str:
    url = _get_provider_url()
    try:
        from urllib.parse import urlparse
        return urlparse(url).hostname or url
    except Exception:
        return url


def get_chainlink_price(feed: str) -> OracleResult:
    address = CHAINLINK_FEEDS.get(feed)
    if address is None:
        raise ValueError(f"Unsupported feed: {feed}")

    try:
        w3 = _get_web3()
        contract = w3.eth.contract(address=Web3.to_checksum_address(address), abi=AGGREGATOR_ABI)
        decimals = contract.functions.decimals().call()
        round_data = contract.functions.latestRoundData().call()
    except Exception as exc:
        raise ConnectionError(f"Failed to fetch oracle data for {feed}: {exc}") from exc

    answer = round_data[1]
    updated_at = round_data[3]
    value = float(answer) / (10 ** decimals)
    return OracleResult(value=value, updated_at=updated_at)


def evaluate_condition(value: float, comparator: str, target: float) -> bool:
    if comparator == ">":
        return value > target
    if comparator == ">=":
        return value >= target
    if comparator == "<":
        return value < target
    if comparator == "<=":
        return value <= target
    raise ValueError("Unsupported comparator")
