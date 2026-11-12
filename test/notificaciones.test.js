const test = require('node:test');
const assert = require('node:assert');
const { validarUrlNotificacion, registrarComercio, urlDeComercio } = require('../src/notificaciones');

test('acepta una url publica https', () => {
  assert.strictEqual(validarUrlNotificacion('https://comercio.example.com/pagos').ok, true);
});

test('rechaza http', () => {
  assert.strictEqual(validarUrlNotificacion('http://comercio.example.com/pagos').ok, false);
});

test('rechaza una direccion privada', () => {
  assert.strictEqual(validarUrlNotificacion('https://10.0.0.8/pagos').ok, false);
  assert.strictEqual(validarUrlNotificacion('https://192.168.1.20/pagos').ok, false);
});

test('rechaza localhost', () => {
  assert.strictEqual(validarUrlNotificacion('https://localhost/pagos').ok, false);
  assert.strictEqual(validarUrlNotificacion('https://127.0.0.1/pagos').ok, false);
});

test('registra la url del comercio', () => {
  const r = registrarComercio('bodega-lucha', 'https://bodega.example.com/aviso');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(urlDeComercio('bodega-lucha'), 'https://bodega.example.com/aviso');
});

test('rechaza la ip de metadatos de AWS', () => {
  assert.strictEqual(validarUrlNotificacion('https://169.254.169.254/latest/meta-data/').ok, false);
});

test('rechaza los bypasses de CVE-2024-29415', () => {
  for (const url of [
    'https://[::ffff:127.0.0.1]/pagos',
    'https://[::ffff:7f00:1]/pagos',
    'https://[::ffff:169.254.169.254]/pagos',
    'https://0/pagos',
    'https://0.0.0.0/pagos',
    'https://[::1]/pagos',
    'https://[::]/pagos',
    'https://[fd00::1]/pagos',
    'https://[fe80::1]/pagos',
    'https://0x7f.1/pagos',
    'https://127.1/pagos',
    'https://172.16.5.4/pagos',
    'https://api.localhost/pagos',
  ]) {
    assert.strictEqual(validarUrlNotificacion(url).ok, false, url);
  }
});

test('acepta ips publicas', () => {
  assert.strictEqual(validarUrlNotificacion('https://8.8.8.8/pagos').ok, true);
  assert.strictEqual(validarUrlNotificacion('https://[2606:4700:4700::1111]/pagos').ok, true);
});
