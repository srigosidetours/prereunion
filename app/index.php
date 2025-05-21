<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan Diario</title>
    <!-- MVP.css and custom.css will be added in the next step -->
    <link rel="stylesheet" href="css/mvp.css">
    <link rel="stylesheet" href="css/custom.css">
    <style>
        /* Basic loading message */
        body.loading::before {
            content: "Cargando componentes...";
            display: block;
            text-align: center;
            padding: 2rem;
            font-style: italic;
        }
    </style>
</head>
<body class="loading">
    <header>
        <h1>Plan Diario</h1>
        <nav>
            <a href="index.php">Inicio</a>
            <a href="admin.php">Admin Panel</a>
        </nav>
    </header>

    <main>
        <section id="user-section">
            <!-- UserDetails component will go here -->
            <template id="user-details-template"></template>
            <user-details></user-details>
        </section>

        <section id="activity-form-section">
            <h2>Añadir Nueva Actividad</h2>
            <!-- AddActivityForm component will go here -->
            <template id="add-activity-form-template"></template>
            <add-activity-form></add-activity-form>
        </section>

        <section id="activity-list-section">
            <h2>Mis Actividades</h2>
            <!-- ActivityList component will go here -->
            <template id="activity-list-template"></template>
            <activity-list></activity-list>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 Planificador Diario</p>
    </footer>

    <!-- Web component scripts will be added later -->
    <script src="js/components/UserDetails.js" defer></script>
    <script src="js/components/ActivityItem.js" defer></script>
    <script src="js/components/ActivityList.js" defer></script>
    <script src="js/components/AddActivityForm.js" defer></script>
    <script src="js/main.js" defer></script>
</body>
</html>
