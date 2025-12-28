<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Carnets – I.E. 6049 "Ricardo Palma" (2025)</title>

    <style>
        :root {
            --card-w: 85.6mm;
            --card-h: 54mm;
            --radius: 3mm;
            --gap-x: 3mm;
            --gap-y: 3mm;

            --rojo: #c6161b;
            --rojo-grad: linear-gradient(90deg, #fc0002 0%, #c6161b 100%);
            --gris-fondo: #e9e9e9;
            --blanco: #fff;
            --negro: #000;
            --bg-carnet: url('data:image/png;base64,{{ $fondoBase64 }}');
        }

        @page {
            size: A4 portrait;
            margin: 5mm 10mm;
        }

        @font-face {
            font-family: 'Chau Philomene One';
            src: url('data:font/ttf;base64,{{ $fontBase64 }}') format('truetype');
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: #fff;
            color: #111;
            font-family: 'Chau Philomene One', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .sheet {
            width: calc(210mm - 20mm);
            height: calc(297mm - 10mm);
            margin: 0 auto;
            display: grid;
            grid-template-columns: var(--card-w) var(--gap-x) var(--card-w);
            grid-template-rows: repeat(5, var(--card-h));
            gap: var(--gap-y) 0;
            place-content: center;
            position: relative;
            page-break-after: always;
        }

        .row {
            display: contents;
        }

        .card {
            width: var(--card-w);
            height: var(--card-h);
            border-radius: var(--radius);
            outline: .25mm dashed rgba(0, 0, 0, .12);
            background: var(--gris-fondo);
            overflow: hidden;
            position: relative;
            box-shadow: 0 0 0 .2mm rgba(0, 0, 0, .06) inset;
        }

        .row .back {
            grid-column: 1;
        }

        .row .front {
            grid-column: 3;
        }

        .hdr {
            height: 21mm;
            padding: 2mm 2mm 1.5mm;
            color: var(--blanco);
            background: var(--rojo-grad);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 3mm;
            border-bottom: 1.5mm solid #fff;
        }

        .escudo {
            width: 18mm;
            height: 18mm;
            border-radius: 1mm;
            display: block;
            object-fit: contain;
        }

        .hdr-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            line-height: 1.05;
        }

        .hdr .center {
            text-align: center;
            margin-right: auto;
            line-height: 1.05;
        }

        .tit1 {
            font-size: 7.5pt;
            line-height: 1;
        }

        .tit2 {
            font-size: 12pt;
            line-height: .95;
            margin-top: .75mm;
        }

        .tit3 {
            font-size: 6pt;
            margin-top: .75mm;
            letter-spacing: .2pt;
            background-color: #be2828;
            padding: 0.5mm 1mm;
            border-radius: 1mm;
        }

        .ugel {
            font-size: 7pt;
            margin-top: .2mm;
            letter-spacing: .2pt;
            margin-top: .75mm;
        }

        .anio {
            font-size: 30pt;
            text-align: right;
            line-height: .9;
        }

        .nivel {
            font-size: 12pt;
            text-align: right;
            line-height: .9;
        }

        .num {
            font-size: 6pt;
            text-align: right;
            opacity: .95;
            margin-top: .5mm;
        }

        .front .body,
        .back .body {
            position: relative;
            height: calc(var(--card-h) - 21mm);
            background: var(--bg-carnet) center/cover no-repeat, var(--gris-fondo);
        }

        .front .grid {
            height: 100%;
            display: grid;
            grid-template-columns: 26mm 1fr;
            gap: 4mm;
            padding: 4mm;
            align-items: center;
        }

        .foto {
            width: 26mm;
            height: 26mm;
            border-radius: 900px;
            background: var(--blanco);
            box-shadow: inset 0 0 0 0.6mm var(--negro);
            overflow: hidden;
        }

        .foto img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .labels {
            line-height: 1.15;
            color: #000;
            display: grid;
            gap: 1.4mm;
        }

        .lab {
            font-size: 10pt;
            white-space: nowrap;
        }

        .strong {
            font-weight: 600;
        }

        .back .grid {
            height: 100%;
            display: grid;
            grid-template-columns: 26mm 1fr;
            gap: 4mm;
            padding: 4mm;
            align-items: center;
        }

        .qr {
            width: 26mm;
            height: 26mm;
            background: var(--blanco);
            border: 0.6mm solid #000;
            border-radius: 1mm;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .qr img {
            width: 90%;
            height: 90%;
            object-fit: contain;
            display: block;
        }

        .txt {
            font-size: 9pt;
            line-height: 1.3;
        }

        @media screen {
            body {
                background: #f5f5f5;
                padding: 12px;
            }

            .sheet {
                background: white;
            }
        }

        @media print {
            .col-title {
                display: none;
            }
        }
    </style>
</head>

<body>
    @foreach($users->chunk(5) as $chunk)
    <main class="sheet">
        @foreach($chunk as $user)
        @php
        // Determinar si es estudiante o docente por la presencia de 'aula'
        $isStudent = isset($user['aula']);
        $isTeacher = isset($user['area']);

        // Obtener nivel
        if ($isStudent) {
        $nivel = strtoupper($user['aula']['level'] ?? 'PRIMARIA');
        $grade = $user['aula']['grade'] ?? null;
        $section = $user['aula']['section'] ?? null;
        } else {
        $nivel = 'DOCENTE';
        $grade = null;
        $section = $user['area'] ?? 'DOCENTE';
        }
        @endphp

        <div class="row">
            {{-- Lado trasero del carnet --}}
            <section class="card back">
                <header class="hdr">
                    <img class="escudo" src="data:image/png;base64,{{ $escudoBase64 }}" alt="Escudo del colegio" />
                    <div class="center">
                        <div class="tit1">Institución Educativa N° 6049</div>
                        <div class="tit2">"RICARDO PALMA"</div>
                        <div class="tit3">INICIAL - PRIMARIA - SECUNDARIA</div>
                        <div class="ugel">UGEL 07 - Surquillo</div>
                    </div>
                    <div>
                        <div class="anio">2025</div>
                        <div class="nivel">{{ $nivel }}</div>
                        <div class="num">{{ str_pad($user['id'], 5, '0', STR_PAD_LEFT) }}</div>
                    </div>
                </header>
                <div class="body">
                    <div class="grid">
                        <div class="foto">
                            {{-- Espacio para foto del usuario --}}
                        </div>
                        <div class="labels">
                            <div class="lab">NOMBRES: <span class="strong">{{ strtoupper($user['name']) }}</span>
                            </div>
                            <div class="lab">APELLIDOS: <span class="strong">{{ strtoupper($user['paternal_surname']) }}
                                    {{ strtoupper($user['maternal_surname']) }}</span></div>
                            <div class="lab">
                                @if($isTeacher)
                                ÁREA: <span class="strong">{{ strtoupper($section) }}</span>
                                @else
                                {{ $nivel === 'INICIAL' ? 'SECCIÓN:' : 'GRADO Y SECCIÓN:' }}
                                <span class="strong">
                                    @if ($nivel === 'INICIAL')
                                    {{ strtoupper($section ?? 'SIN SECCIÓN') }}
                                    @elseif ($grade)
                                    {{ $grade }}°{{ $section ?? '' }}
                                    @else
                                    {{ $section ?? '-' }}
                                    @endif
                                </span>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {{-- Lado frontal del carnet --}}
            <section class="card front">
                <header class="hdr">
                    <img class="escudo" src="data:image/png;base64,{{ $escudoBase64 }}" alt="Escudo del colegio" />
                    <div class="center">
                        <div class="tit1">Institución Educativa N° 6049</div>
                        <div class="tit2">"RICARDO PALMA"</div>
                        <div class="tit3">INICIAL - PRIMARIA - SECUNDARIA</div>
                        <div class="ugel">UGEL 07 - Surquillo</div>
                    </div>
                    <div>
                        <div class="anio">2025</div>
                        <div class="nivel">{{ $nivel }}</div>
                        <div class="num">{{ str_pad($user['id'], 5, '0', STR_PAD_LEFT) }}</div>
                    </div>
                </header>
                <div class="body">
                    <div class="grid">
                        <div class="qr">
                            @if(!empty($user['qr_base64']))
                            <img src="data:image/svg+xml;base64,{{ $user['qr_base64'] }}" alt="QR {{ $user['name'] }}">
                            @endif
                        </div>
                        <div class="txt">
                            <div class="lab">NOMBRES: <span class="strong">{{ strtoupper($user['name']) }}</span>
                            </div>
                            <div class="lab">APELLIDOS: <span class="strong">{{ strtoupper($user['paternal_surname']) }}
                                    {{ strtoupper($user['maternal_surname']) }}</span></div>
                            <div class="lab">
                                @if($isTeacher)
                                ÁREA: <span class="strong">{{ strtoupper($section) }}</span>
                                @else
                                {{ $nivel === 'INICIAL' ? 'SECCIÓN:' : 'GRADO Y SECCIÓN:' }}
                                <span class="strong">
                                    @if ($nivel === 'INICIAL')
                                    {{ strtoupper($section ?? 'SIN SECCIÓN') }}
                                    @elseif ($grade)
                                    {{ $grade }}°{{ $section ?? '' }}
                                    @else
                                    {{ $section ?? '-' }}
                                    @endif
                                </span>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        @endforeach
    </main>
    @endforeach

</body>

</html>