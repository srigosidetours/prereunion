<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - Plan Diario</title>
    <!-- MVP.css and custom.css will be added in the next step -->
    <link rel="stylesheet" href="css/mvp.css">
    <link rel="stylesheet" href="css/custom.css">
     <style>
        /* Basic loading message */
        body.loading::before {
            content: "Cargando componentes de administración...";
            display: block;
            text-align: center;
            padding: 2rem;
            font-style: italic;
        }
    </style>
</head>
<body class="loading">
    <header>
        <h1>Panel de Administración</h1>
        <nav>
            <a href="index.php">Vista Pública</a>
            <a href="admin.php">Admin Home</a>
        </nav>
    </header>

    <main>
        <section id="admin-activity-list-section">
            <h2>Gestión de Actividades</h2>
            <!-- AdminActivityList component will go here -->
            <template id="admin-activity-list-template"></template>
            <admin-activity-list></admin-activity-list>
        </section>

        <section id="admin-user-manager-section">
            <h2>Gestión de Usuarios</h2>
            <!-- AdminUserManager component will go here -->
            <template id="admin-user-manager-template"></template>
            <admin-user-manager></admin-user-manager>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 Planificador Diario - Admin</p>
    </footer>

    <!-- Web component scripts will be added later -->
    <script src="js/components/AdminActivityList.js" defer></script>
    <script src="js/components/AdminUserManager.js" defer></script>
    <script src="js/admin.js" defer></script>
</body>
</html>
