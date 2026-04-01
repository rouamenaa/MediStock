import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080', // URL Keycloak
  realm: 'medistock-realm',
  clientId: 'medistock-client'
});

export default keycloak;