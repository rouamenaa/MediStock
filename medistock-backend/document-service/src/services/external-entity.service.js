class ExternalEntityService {
  constructor() {
    this.gatewayBaseUrl = (process.env.GATEWAY_BASE_URL || 'http://localhost:8090').replace(/\/+$/, '');
    this.timeoutMs = Number(process.env.EXTERNAL_TIMEOUT_MS || 5000);
  }

  async getEntitySnapshot(entityType, entityId) {
    const route = this.resolveRoute(entityType, entityId);
    if (!route) {
      return null;
    }

    return this.fetchJson(route);
  }

  resolveRoute(entityType, entityId) {
    const encodedId = encodeURIComponent(String(entityId));
    const routes = {
      ORDER: `/orders/api/orders/${encodedId}`,
      MEDICATION: `/api/catalog/medications/${encodedId}`,
      STOCK: `/stock/api/stockitems/${encodedId}`,
      PHARMACY: `/api/pharmacies/${encodedId}`
    };

    return routes[entityType] || null;
  }

  async fetchJson(pathname) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.gatewayBaseUrl}${pathname}`, {
        method: 'GET',
        signal: controller.signal
      });

      if (!response.ok) {
        return {
          available: false,
          status: response.status
        };
      }

      const data = await response.json();
      return {
        available: true,
        status: response.status,
        data
      };
    } catch (_error) {
      return {
        available: false,
        status: 503
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = new ExternalEntityService();
