@php
$currentYear = date('Y');
@endphp

@if($isFirst)
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carnets - {{ $tenant->name }}</title>

    <style>
        @page {
            size: A4 portrait;
            margin: 5mm 0;
        }

        @font-face {
            font-family: 'Chau Philomene One';
            src: url('data:font/ttf;base64,{{ $fontBase64 }}') format('truetype');
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: #fff;
            font-family: 'Chau Philomene One', sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .page-a4 {
            width: 210mm;
            height: 287mm;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 85.6mm 85.6mm;
            grid-template-rows: repeat(5, 54mm);
            gap: 2mm 4mm;
            place-content: center;
            page-break-after: always;
        }

        .carnet-container {
            width: 85.6mm;
            height: 54mm;
            background-color: #e9e9e9;
            border-radius: 3mm;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            border: 0.1mm dashed #bbb;
        }

        .header {
            background-color: {{ $tenant->primary_color ?? '#E30613' }};
            background-image: url('data:image/png;base64,{{ $escudoBase64 }}');
            background-repeat: no-repeat;
            background-size: 65% auto;
            background-position: 5px center;
            height: 32%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0 3mm;
            position: relative;
            z-index: 10;
        }

        .anio-nivel {
            color: white;
            text-align: right;
            line-height: 0.85;
            width: 40%;
        }

        .anio {
            font-size: 22pt;
            font-weight: 400;
            display: block;
        }

        .nivel {
            font-size: 8pt;
            margin-top: 0.8mm;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            display: block;
        }

        .codigo {
            font-size: 8pt;
            text-align: right;
            margin-top: 0.5mm;
            display: block;
        }

        .body-section {
            flex-grow: 1;
            width: 100%;
            position: relative;
            display: flex;
            align-items: center;
            padding: 0 4mm;
            overflow: hidden;
            background-image: url('data:image/png;base64,{{ $fondoBase64 }}');
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
        }

        .content-wrapper {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4mm;
        }

        .photo-frame,
        .qr-frame {
            width: 25mm;
            height: 25mm;
            background-color: white;
            border: 0.6mm solid black;
            border-radius: 1.5mm;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            overflow: hidden;
        }

        .photo-frame img,
        .qr-frame img {
            width: 95%;
            height: 95%;
            object-fit: cover;
        }

        .footer {
            height: 16%;
            width: 100%;
            background-color: {{ $tenant->primary_color ?? '#E30613' }};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10;
            padding: 0 2mm;
        }

        .student-name {
            color: white;
            font-size: 13pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 95%;
        }

        @media print {
            body {
                background: none;
                padding: 0;
            }

            .page-a4 {
                box-shadow: none;
            }
        }
    </style>
</head>

<body>
    @endif

    @foreach($users->chunk(10) as $chunk)
    <div class="page-a4">
        @foreach($chunk as $user)
        <div class="carnet-container">
            <div class="header">
                <div class="anio-nivel">
                    <span class="anio">{{ $currentYear }}</span>
                    @if($user->user_type === 'student' && isset($user->classroom))
                    <span class="nivel">{{ $user->classroom->level }}</span>
                    <span class="codigo">
                        {{ $user->classroom->grade }}
                        {{ $user->classroom->level === 'INICIAL' ? ' AÑOS' : '°' }}
                        {{ $user->classroom->section }}
                    </span>
                    @else
                    <span class="nivel">{{ $user->level }}</span>
                    <span class="codigo">{{ strtoupper($user->user_type === 'teacher' ? 'DOCENTE' : '') }}</span>
                    @endif
                </div>
            </div>

            <div class="body-section">
                <div class="content-wrapper">
                    <div class="photo-frame">
                        @if(isset($user->photo_url) && $user->photo_url)
                        <img src="{{ Storage::url($user->photo_url) }}" alt="Foto" referrerpolicy="no-referrer">
                        @endif
                    </div>
                    <div class="qr-frame">
                        @if($user->qr_base64)
                        <img src="data:image/svg+xml;base64,{{ $user->qr_base64 }}" alt="QR Code"
                            referrerpolicy="no-referrer">
                        @endif
                    </div>
                </div>
            </div>

            <div class="footer">
                @php
                $fontSize = strlen($user->full_name) > 25 ? '10pt' : '13pt';
                @endphp
                <span class="student-name" style="font-size: {{ $fontSize }}">{{ $user->full_name }}</span>
            </div>
        </div>
        @endforeach
    </div>
    @endforeach

    @if($isLast)
</body>

</html>
@endif