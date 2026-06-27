"""Temporal worker entrypoint for Hermes's content-run pipeline. Mirrors
server/src/worker.ts's structure -- a separate long-running process from the
FastAPI app (see Procfile), polling its own task queue on the same Temporal
cluster the NestJS-side ad-automation/trend-signals/ds-star-science workers use.
"""
import asyncio
import os

from temporalio.client import Client
from temporalio.worker import Worker

from temporal_activities import run_production_agent
from temporal_codec import EncryptionCodec
from temporal_workflows import ContentRunWorkflow

TASK_QUEUE = "hermes-content-run"


async def main():
    address = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")
    print(f"[temporal_worker] Connecting to Temporal Cluster at {address}...")
    client = await Client.connect(address, data_converter=_data_converter())
    print(f"[temporal_worker] Connected. Polling task queue '{TASK_QUEUE}'...")

    worker = Worker(
        client,
        task_queue=TASK_QUEUE,
        workflows=[ContentRunWorkflow],
        activities=[run_production_agent],
    )
    await worker.run()


def _data_converter():
    from temporalio.converter import DataConverter

    return DataConverter(payload_codec=EncryptionCodec())


if __name__ == "__main__":
    asyncio.run(main())
