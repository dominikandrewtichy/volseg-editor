# VolSeg Editor Helm Chart

This directory contains the Helm chart for deploying the VolSeg Editor application stack on Kubernetes.

The stack consists of:
* **Web**: React frontend served via Nginx.
* **API**: FastAPI backend.
* **MinIO**: S3-compatible object storage.
* **Postgres**: Database cluster (managed via CloudNativePG).
* **Migrations**: Database migration jobs.

## Prerequisites

Before installing the chart, ensure your Kubernetes cluster has the following prerequisites installed:

1.  **Kubernetes** v1.24+
2.  **Helm** v3.0+
3.  **CloudNativePG Operator**: This chart uses the `postgresql.cnpg.io/v1` API to provision the database. You must have the CNPG operator installed.
    * [Installation Guide](https://cloudnative-pg.io/documentation/current/installation_upgrade/)
4.  **Cert-Manager**: Required for automatic TLS certificate generation via Let's Encrypt (referenced in Ingress templates).
5.  **Nginx Ingress Controller**: The Ingress resources are configured for class `nginx`.

## Installation

### 1. Configure Secrets and Values
Create a `my-values.yaml` file to override default settings, particularly secrets and domain names.

```yaml
# my-values.yaml
namespace: my-namespace

api:
  env:
    apiServerUrl: "[https://api.example.com](https://api.example.com)"
    webServerUrl: "[https://web.example.com](https://web.example.com)"
    oidcIssuerUrl: "[https://your-oidc-provider.com/realm](https://your-oidc-provider.com/realm)"
    oidcRedirectUri: "[https://api.example.com/api/v1/auth/callback](https://api.example.com/api/v1/auth/callback)"
  secrets:
    oidcClientId: "your-client-id"
    oidcClientSecret: "your-client-secret"
    jwtSecretKey: "generate-a-strong-random-key"
    cookiesSessionSecret: "generate-another-strong-key"

minio:
  secrets:
    rootUser: "admin"
    rootPassword: "supersecretpassword"