<?php
/*
 * Formulario "Platiquemos de tu proceso" — envío por correo.
 * Funciona en Hostinger (PHP con mail()). En GitHub Pages no se ejecuta PHP;
 * ahí script.js usa como respaldo el correo del visitante (mailto).
 * El remitente debe ser una cuenta del propio dominio para que el correo no caiga en spam.
 * El repositorio es público: aquí no va ninguna contraseña (DOCUMENTACION.md §8).
 */

$DESTINO   = 'rvertti@4wardcorp.com';
$REMITENTE = 'rvertti@4wardcorp.com';

// Límite de envíos por conexión (IP): máximo por ventana de tiempo, en segundos.
$LIMITES = [
    [3, 10 * 60],      // 3 cada 10 minutos
    [10, 24 * 3600],   // 10 cada 24 horas
];
$MAX_ENLACES = 2;      // más enlaces que esto en el mensaje se rechaza
$TIEMPO_MIN  = 3000;   // ms mínimos con el formulario abierto (los robots lo llenan al instante)

ini_set('display_errors', '0');   // nunca mostrar errores de PHP al visitante (revelarían rutas del servidor)
date_default_timezone_set('America/Mexico_City');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function responder($ok, $msg, $code = 200) {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'msg' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

// Lee un campo del POST solo si es texto (un arreglo como nombre[]=… se trata como vacío).
function campo($k) {
    $v = $_POST[$k] ?? '';
    return is_string($v) ? $v : '';
}

// Limpia un campo de una línea: sin saltos ni caracteres de control (evita inyección de encabezados) y con largo máximo.
function linea($v, $max) {
    $v = trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '');
    return mb_substr($v, 0, $max, 'UTF-8');
}

// Texto para un encabezado de correo, siempre codificado (Base64 en trozos): comas, comillas o acentos no rompen el encabezado.
function encabezado($texto) {
    $trozos = mb_str_split($texto, 10, 'UTF-8') ?: [''];
    return implode("\r\n ", array_map(fn($t) => '=?UTF-8?B?' . base64_encode($t) . '?=', $trozos));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método no permitido.', 405);
}

// Solo se aceptan envíos desde el propio sitio (si el navegador manda Origin, debe ser este dominio).
if (!empty($_SERVER['HTTP_ORIGIN'])) {
    $origen = strtolower((string)parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST));
    $host   = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
    if ($origen === '' || $origen !== $host) {
        responder(false, 'Solicitud no permitida.', 403);
    }
}

// Filtros contra robots: campo trampa invisible y tiempo mínimo con el formulario abierto.
// "tiempo" lo calcula script.js en el navegador (ms desde que se abrió el formulario), así no depende del reloj del visitante.
// Si falta o es menor al mínimo, se responde "Gracias" sin enviar, para no darle pistas al robot.
if (campo('sitio_web') !== '') {
    responder(true, 'Gracias.');
}
if ((int)campo('tiempo') < $TIEMPO_MIN) {
    responder(true, 'Gracias.');
}

$nombre   = linea(campo('nombre'), 120);
$empresa  = linea(campo('empresa'), 160);
$correo   = linea(campo('correo'), 160);
$telefono = linea(campo('telefono'), 40);
$sector   = linea(campo('sector'), 60);
// Mensaje de varias líneas: se conservan saltos y tabuladores, se quitan otros caracteres de control.
$proceso  = str_replace(["\r\n", "\r"], "\n", campo('proceso'));
$proceso  = trim(preg_replace('/[\x00-\x08\x0B-\x1F\x7F]/u', '', $proceso) ?? '');
$proceso  = mb_substr($proceso, 0, 3000, 'UTF-8');
$acepta   = campo('acepta') !== '';

// Correo con formato común (sin comillas, comas ni espacios); además debe pasar la validación de PHP.
$correoOk = filter_var($correo, FILTER_VALIDATE_EMAIL)
         && preg_match('/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/', $correo);

if ($nombre === '' || $empresa === '' || $proceso === '' || !$correoOk) {
    responder(false, 'Revisa los campos obligatorios.', 422);
}
if (!$acepta) {
    responder(false, 'Es necesario aceptar el aviso de privacidad.', 422);
}
if (preg_match_all('~https?://|www\.~i', "$nombre $empresa $telefono $proceso") > $MAX_ENLACES) {
    responder(false, 'Tu mensaje tiene demasiados enlaces; quita algunos e intenta de nuevo.', 422);
}

/* Límite de envíos por conexión.
 * Se guarda solo un código irreversible de la IP (HMAC con una clave aleatoria del servidor) y la hora de cada envío,
 * en una carpeta fuera de la carpeta pública del sitio; los registros de más de 24 h se borran solos. */
function carpetaLimites() {
    foreach ([dirname(__DIR__) . '/formulario-limites', sys_get_temp_dir() . '/formulario-limites-4ward'] as $dir) {
        if ((is_dir($dir) || @mkdir($dir, 0700, true)) && is_writable($dir)) return $dir;
    }
    return null;
}
$dirLim = carpetaLimites();
if ($dirLim !== null) {
    $archivoClave = $dirLim . '/clave';
    if (!is_file($archivoClave)) { @file_put_contents($archivoClave, bin2hex(random_bytes(32)), LOCK_EX); @chmod($archivoClave, 0600); }
    $clave = (string)@file_get_contents($archivoClave);
    $id = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', $clave);
    $archivo = "$dirLim/$id.json";
    $ahora = time();
    $fh = @fopen($archivo, 'c+');
    @chmod($archivo, 0600);
    if ($fh && flock($fh, LOCK_EX)) {
        $envios = json_decode(stream_get_contents($fh) ?: '[]', true) ?: [];
        $envios = array_values(array_filter($envios, fn($t) => is_int($t) && $t > $ahora - 24 * 3600));
        foreach ($LIMITES as [$max, $ventana]) {
            if (count(array_filter($envios, fn($t) => $t > $ahora - $ventana)) >= $max) {
                flock($fh, LOCK_UN); fclose($fh);
                responder(false, 'Ya recibimos varios mensajes desde tu conexión. Intenta más tarde o escríbenos a ' . $DESTINO . '.', 429);
            }
        }
        $envios[] = $ahora;
        ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($envios));
        flock($fh, LOCK_UN); fclose($fh);
    }
    // Limpieza ocasional: borra registros sin envíos en las últimas 24 h
    if (mt_rand(1, 20) === 1) {
        foreach (glob("$dirLim/*.json") ?: [] as $f) {
            if (@filemtime($f) < $ahora - 24 * 3600) @unlink($f);
        }
    }
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
// Quoted-printable: corta las líneas largas (límite de 998 caracteres del estándar de correo) sin cambiar el texto.
$cuerpo = str_replace("\r\n", "\n", quoted_printable_encode(str_replace("\n", "\r\n", $cuerpo)));

$encabezados = [
    'From: ' . encabezado('4ward Solutions (sitio web)') . ' <' . $REMITENTE . '>',
    'Reply-To: ' . encabezado($nombre) . ' <' . $correo . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
];

$enviado = mail($DESTINO, encabezado($asunto), $cuerpo, implode("\r\n", $encabezados), '-f' . $REMITENTE);

if ($enviado) {
    responder(true, 'Gracias. Recibimos tu mensaje y te contactaremos pronto.');
}
responder(false, 'No se pudo enviar. Escríbenos a ' . $DESTINO . '.', 500);
