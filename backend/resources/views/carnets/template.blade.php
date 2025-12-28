<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carnets - {{ $tenant->name }}</title>

    <style>
        @page {
            size: A4;
            margin: 0;
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
            background-color: #ccc;
            font-family: 'Chau Philomene One', sans-serif;
            display: flex;
            justify-content: center;
            padding: 20px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .page-a4 {
            width: 210mm;
            height: 297mm;
            background-color: white;
            padding-top: 6mm;
            padding-bottom: 6mm;
            padding-left: 0;
            padding-right: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            page-break-after: always;
        }

        .grid-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: repeat(5, 1fr);
            column-gap: 2mm;
            row-gap: 2mm;
        }

        @media print {
            body {
                background: none;
                padding: 0;
                display: block;
            }

            .page-a4 {
                box-shadow: none;
                margin: 0 auto;
                width: 210mm;
                height: 297mm;
                page-break-after: always;
                page-break-inside: avoid;
            }
        }

        .grid-cell {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .cut-line {
            position: relative;
            width: 336px;
            height: 210px;
            border: 1px dashed #bbb;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }

        .scale-wrapper {
            transform: scale(0.335);
            transform-origin: center;
            width: 1004px;
            height: 626px;
            position: absolute;
            display: flex;
            flex-direction: column;
        }

        .carnet-container {
            width: 1004px;
            height: 626px;
            background-color: #e9e9e9;
            border-radius: 35px;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .header {
            background-color: {{ $tenant->primary_color ?? '#E30613' }};
            height: 32%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 35px;
            position: relative;
            z-index: 10;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .logo-titulo-container {
            width: 68%;
            height: 100%;
            display: flex;
            align-items: center;
        }
        
        .logo-img {
            width: 75%;
            height: auto;
            object-fit: contain;
            object-position: left center;
        }

        .anio-nivel {
            color: white;
            text-align: right;
            line-height: 0.85;
            width: 32%;
            padding-right: 5px;
            padding-top: 5px;
        }

        .anio {
            font-size: 85px;
            font-weight: 400;
            display: block;
        }

        .nivel {
            font-size: 34px;
            font-weight: 400;
            display: block;
            margin-top: 8px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .codigo {
            font-size: 30px;
            display: block;
            text-align: right;
            margin-top: 8px;
        }

        .body-section {
            flex-grow: 1;
            width: 100%;
            position: relative;
            display: flex;
            align-items: center;
            padding: 0 50px;
            overflow: hidden;
        }

        .bg-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        .bg-pattern img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.6;
        }

        .content-wrapper {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 25px;
        }

        .photo-frame,
        .qr-frame {
            width: 290px;
            height: 290px;
            background-color: white;
            border: 8px solid black;
            border-radius: 18px;
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
            height: 15%;
            width: 100%;
            background-color: {{ $tenant->primary_color ?? '#E30613' }};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10;
            padding: 10px 20px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .student-name {
            color: white;
            font-size: 50px;
            text-transform: uppercase;
            letter-spacing: 1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 95%;
        }

        .institution-info {
            color: white;
            font-size: 20px;
            margin-top: 5px;
            text-align: center;
        }
    </style>
</head>

<body>
    @php
        $currentYear = date('Y');
    @endphp

    @foreach($users->chunk(10) as $chunk)
    <div class="page-a4">
        <div class="grid-container">
            @foreach($chunk as $user)
            <div class="grid-cell">
                <div class="cut-line">
                    <div class="scale-wrapper">
                        <div class="carnet-container">
                            <div class="header">
                                <div class="logo-titulo-container">
                                    <img src="data:image/png;base64,{{ $escudoBase64 }}" alt="Logo" class="logo-img" referrerpolicy="no-referrer">
                                </div>
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
                                <div class="bg-pattern">
                                    <img src="data:image/png;base64,{{ $fondoBase64 }}" alt="Fondo" referrerpolicy="no-referrer">
                                </div>
                                <div class="content-wrapper">
                                    <div class="photo-frame">
                                        @if(isset($user->photo_url) && $user->photo_url)
                                            <img src="{{ Storage::url($user->photo_url) }}" alt="Foto" referrerpolicy="no-referrer">
                                        @endif
                                    </div>

                                    <div class="qr-frame">
                                        @if($user->qr_base64)
                                            <img src="data:image/svg+xml;base64,{{ $user->qr_base64 }}" alt="QR Code" referrerpolicy="no-referrer">
                                        @endif
                                    </div>
                                </div>
                            </div>

                            <div class="footer">
                                <span class="student-name">{{ $user->full_name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
    @endforeach

</body>

</html>
