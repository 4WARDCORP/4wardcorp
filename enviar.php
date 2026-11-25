<?php
/*
 * Formulario "Platiquemos de tu proceso" — envío por correo.
 * Funciona en Hostinger (PHP con mail()). En GitHub Pages no se ejecuta PHP;
 * ahí script.js usa como respaldo el correo del visitante (mailto).
 * El remitente debe ser una cuenta del propio dominio para que el correo no caiga en spam.
 */

$DESTINO   = 'rvertti@4wardcorp.com';
$REMITENTE = 'rvertti@4wardcorp.com';

date_default_timezone_set('America/Mexico_City');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function responder($ok, $msg, $code = 200) {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'msg' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método no permitido.', 405);
}

// Limpia un campo de una línea: sin saltos (evita inyección de encabezados) y con largo máximo.
function linea($v, $max) {
    $v = trim(preg_replace('/[\r\n\t]+/', ' ', (string)$v));
    return mb_substr($v, 0, $max, 'UTF-8');
}

// Filtros contra robots: campo trampa invisible y tiempo mínimo para llenar el formulario.
if (!empty($_POST['sitio_web'])) {
    responder(true, 'Gracias.');
}
$inicio = isset($_POST['t0']) ? (int)$_POST['t0'] : 0;
if ($inicio > 0 && (time() * 1000 - $inicio) < 3000) {
    responder(true, 'Gracias.');
}

$nombre   = linea($_POST['nombre']   ?? '', 120);
$empresa  = linea($_POST['empresa']  ?? '', 160);
$correo   = linea($_POST['correo']   ?? '', 160);
$telefono = linea($_POST['telefono'] ?? '', 40);
$sector   = linea($_POST['sector']   ?? '', 60);
$proceso  = mb_substr(trim((string)($_POST['proceso'] ?? '')), 0, 3000, 'UTF-8');
$acepta   = !empty($_POST['acepta']);

if ($nombre === '' || $empresa === '' || $proceso === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'Revisa los campos obligatorios.', 422);
}
if (!$acepta) {
    responder(false, 'Es necesario aceptar el aviso de privacidad.', 422);
}

$asunto = 'Contacto web – ' . $empresa;
$cuerpo = "Nuevo contacto desde el sitio de 4ward Solutions\n"
        . "------------------------------------------------\n"
        . "Nombre:   $nombre\n"
        . "Empresa:  $empresa\n"
        . "Correo:   $correo\n"
        . "Teléfono: " . ($telefono !== '' ? $telefono : '—') . "\n"
        . "Sector:   " . ($sector !== '' ? $sector : '—') . "\n\n"
        . "¿Qué proceso quiere mejorar?\n$proceso\n\n"
        . "------------------------------------------------\n"
        . "Aceptó el aviso de privacidad: sí\n"
        . "Fecha: " . date('Y-m-d H:i') . "\n";

$encabezados = [
    'From: 4ward Solutions (sitio web) <' . $REMITENTE . '>',
    'Reply-To: ' . mb_encode_mimeheader(str_replace(['"', '<', '>'], '', $nombre), 'UTF-8') . ' <' . $correo . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

$asuntoCodificado = '=?UTF-8?B?' . base64_encode($asunto) . '?=';
$enviado = mail($DESTINO, $asuntoCodificado, $cuerpo, implode("\r\n", $encabezados), '-f' . $REMITENTE);

if ($enviado) {
    responder(true, 'Gracias. Recibimos tu mensaje y te contactaremos pronto.');
}
responder(false, 'No se pudo enviar. Escríbenos a ' . $DESTINO . '.', 500);
