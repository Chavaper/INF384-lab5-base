const net = require('net');

// Reemplaza a la libreria `ip` (CVE-2024-29415, sin version corregida): su
// isPrivate() aceptaba direcciones internas como ::ffff:127.0.0.1 o 0.0.0.0.
// Ver DECISIONES.md, Decision 2.
const DESTINOS_INTERNOS = new net.BlockList();
[
  ['0.0.0.0', 8], // "esta red", incluye 0.0.0.0
  ['10.0.0.0', 8], // privada
  ['100.64.0.0', 10], // CGNAT
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local, incluye metadatos 169.254.169.254
  ['172.16.0.0', 12], // privada
  ['192.0.0.0', 24], // asignaciones IETF
  ['192.168.0.0', 16], // privada
  ['198.18.0.0', 15], // benchmarking
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reservada y broadcast
].forEach(([red, prefijo]) => DESTINOS_INTERNOS.addSubnet(red, prefijo, 'ipv4'));
[
  ['::', 128], // no especificada
  ['::1', 128], // loopback
  ['64:ff9b::', 96], // NAT64
  ['2002::', 16], // 6to4, embebe una IPv4
  ['fc00::', 7], // unique local
  ['fe80::', 10], // link-local
  ['ff00::', 8], // multicast
].forEach(([red, prefijo]) => DESTINOS_INTERNOS.addSubnet(red, prefijo, 'ipv6'));

// BlockList compara las IPv4 mapeadas en IPv6 (::ffff:a.b.c.d) contra las
// reglas IPv4, asi que ::ffff:127.0.0.1 cae en 127.0.0.0/8.
function esDestinoInterno(host) {
  const familia = net.isIP(host);
  if (familia === 0) return false;
  return DESTINOS_INTERNOS.check(host, familia === 6 ? 'ipv6' : 'ipv4');
}

const comercios = new Map();

function validarUrlNotificacion(valor) {
  let url;
  try {
    url = new URL(valor);
  } catch (e) {
    return { ok: false, error: 'url invalida' };
  }
  if (url.protocol !== 'https:') {
    return { ok: false, error: 'solo https' };
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return { ok: false, error: 'destino interno' };
  }
  if (esDestinoInterno(host)) {
    return { ok: false, error: 'destino interno' };
  }
  return { ok: true, url: url.toString() };
}

function registrarComercio(comercio, urlNotificacion) {
  const resultado = validarUrlNotificacion(urlNotificacion);
  if (!resultado.ok) return resultado;
  comercios.set(comercio, resultado.url);
  return { ok: true, comercio, url: resultado.url };
}

function urlDeComercio(comercio) {
  return comercios.get(comercio) || null;
}

module.exports = { validarUrlNotificacion, registrarComercio, urlDeComercio };
