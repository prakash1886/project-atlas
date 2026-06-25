import { proxyActivities } from '@temporalio/workflow';
import type { AdAutomationActivities } from '../activities/ad-automation.activities.js';

const { scanTrends, generateAdContent, registerPrintOnDemand, publishToShopify } =
  proxyActivities<AdAutomationActivities>({
    taskQueue: 'ad-automation',
    startToCloseTimeout: '5 minutes',
  });

export async function adAutomationWorkflow(topic: string): Promise<string> {
  // 1. Scan and verify the trend details
  const trendDetails = await scanTrends(topic);

  // 2. Generate ad copywriting and vector graphics prompts (via Modal serverless GPU)
  const adContext = await generateAdContent(trendDetails);

  // 3. Register print-on-demand product template via Printful/Printify
  const podResult = await registerPrintOnDemand(adContext);

  // 4. Publish active product listing live to the Shopify store catalog
  const liveLink = await publishToShopify(podResult);

  return liveLink;
}
