<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plantilla Impresión A4 - 10 Carnets Modificado</title>
    <!-- Importar tipografía Chau Philomene One -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chau+Philomene+One:ital@0;1&display=swap" rel="stylesheet">

    <style>
        /* --- CONFIGURACIÓN DE PÁGINA A4 --- */
        @page {
            size: A4;
            margin: 0;
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
        }

        /* Hoja Física A4 */
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
        }

        /* Contenedor de la grilla */
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

        /* --- CÉLULA DE LA GRILLA --- */
        .grid-cell {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        /* LÍNEA DE RECORTE */
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

        /* Wrapper para escalar el diseño original */
        .scale-wrapper {
            transform: scale(0.335);
            transform-origin: center;
            width: 1004px;
            height: 626px;
            position: absolute;
            display: flex;
            flex-direction: column;
        }

        /* --- ESTILOS DEL CARNET --- */
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

        /* HEADER: Ajustado altura para dar espacio al footer */
        .header {
            background-color: #E30613;
            height: 32%;
            /* Reducido ligeramente */
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
            width: 100%;
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
            /* Ajustado ligeramente */
            font-weight: 400;
            display: block;
        }

        .nivel {
            font-size: 34px;
            font-weight: 400;
            display: block;
            margin-top: 8px;
            letter-spacing: 1px;
        }

        .codigo {
            font-size: 30px;
            display: block;
            text-align: right;
            margin-top: 8px;
        }

        /* BODY: Ocupa el espacio central */
        .body-section {
            flex-grow: 1;
            /* Ocupa el espacio restante entre header y footer */
            width: 100%;
            position: relative;
            display: flex;
            align-items: center;
            padding: 0 50px;
            overflow: hidden;
            /* Asegura que el patrón no se salga */
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
            /* Reducido para juntar más los cuadrados */
        }

        /* Cuadro de foto y Cuadro extra */
        .photo-frame,
        .second-square {
            width: 290px;
            /* Ajustado para que quepa bien con el footer */
            height: 290px;
            background-color: white;
            border: 8px solid black;
            border-radius: 18px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
        }

        /* Estilo específico para el segundo cuadro si se desea diferenciar */
        .second-square {
            /* Mismo estilo visual por ahora, como solicitado */
        }

        /* FOOTER: Franja roja abajo */
        .footer {
            height: 15%;
            /* Espacio para el nombre */
            width: 100%;
            background-color: #E30613;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .student-name {
            color: white;
            font-size: 50px;
            /* Tamaño grande para el nombre */
            text-transform: uppercase;
            letter-spacing: 1px;
            white-space: nowrap;
        }
    </style>
</head>

<body>

    <!-- Hoja A4 -->
    <div class="page-a4">
        <div class="grid-container" id="gridContainer">
            <!-- El contenido se generará con JS -->
        </div>
    </div>

    <script>
        // IDs extraídos de los enlaces de Google Drive
        const idEscudo = "1z6jHbL98Xc2-i8-fwM1hy0Cb-f6Y4f5f";
        const idFondo = "1h7Asf1AB5yVuAyyRpFBMceir204pbSff";

        const urlEscudo = `https://drive.google.com/thumbnail?id=${idEscudo}&sz=w1000`;
        const urlFondo = `https://drive.google.com/thumbnail?id=${idFondo}&sz=w1000`;

        // Estructura HTML modificada
        const carnetHTML = `
            <div class="cut-line">
                <div class="scale-wrapper">
                    <div class="carnet-container">
                        <!-- HEADER -->
                        <div class="header">
                            <div class="logo-titulo-container">
                                <img src="${urlEscudo}" alt="Logo" class="logo-img" referrerpolicy="no-referrer">
                            </div>
                            <div class="anio-nivel">
                                <span class="anio">2025</span>
                                <span class="nivel">PRIMARIA</span>
                                <span class="codigo">3°A</span>
                            </div>
                        </div>

                        <!-- BODY -->
                        <div class="body-section">
                            <div class="bg-pattern">
                                <img src="${urlFondo}" alt="Fondo" referrerpolicy="no-referrer">
                            </div>
                            <div class="content-wrapper">
                                <!-- Cuadro Foto (Izquierda) -->
                                <div class="photo-frame"></div>
                                
                                <!-- Nuevo Cuadrado (Derecha) - Reemplaza al texto -->
                                <div class="second-square"></div>
                            </div>
                        </div>

                        <!-- FOOTER (Nuevo) -->
                        <div class="footer">
                            <span class="student-name">THIAGO GOHAN AURES CAÑIHUA</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('gridContainer');

        // Generar 10 celdas
        for (let i = 0; i < 10; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.innerHTML = carnetHTML;
            container.appendChild(cell);
        }
    </script>
</body>

</html>