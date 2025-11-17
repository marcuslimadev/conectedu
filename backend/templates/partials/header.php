<!-- backend/templates/partials/header.php -->
<div class="header">
    <h1><?php echo v($data, 'main_title', 'DOCUMENTO'); ?></h1>
    <div class="document-subtitle">Data: <?php echo v($data, 'document_date', date('d/m/Y')); ?></div>
</div>
