<!-- backend/templates/partials/header.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        <?php echo file_get_contents(__DIR__ . '/../pdf-styles.css'); ?>
    </style>
</head>
<body>
    <div class="header">
        <h1><?php echo v($data, 'main_title', 'DOCUMENTO'); ?></h1>
        <div class="document-subtitle">Data: <?php echo v($data, 'document_date', date('d/m/Y')); ?></div>
    </div>
</body>
</html>
