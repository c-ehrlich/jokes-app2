import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: "jokes-app",
  }),
  spanProcessor: new SimpleSpanProcessor(
    new OTLPTraceExporter({
      url: "https://api.axiom.co/v1/traces",
      headers: {
        Authorization: `Bearer ${process.env.AXIOM_API_TOKEN}`,
        "X-Axiom-Dataset": process.env.AXIOM_DATASET,
      },
    }),
  ),
});
sdk.start();
