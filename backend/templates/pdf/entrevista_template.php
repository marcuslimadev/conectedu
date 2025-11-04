<?php
/**
 * Template PDF: Entrevista com o Responsavel
 */

// Helper para preencher valores com seguranca
function v($data, $key, $default = '') {
    return htmlspecialchars($data[$key] ?? $default, ENT_QUOTES, 'UTF-8');
}

$css = file_get_contents(__DIR__ . '/style.css');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Entrevista com Responsável</title>
    <style><?php echo $css; ?></style>
</head>
<body>
    <!-- Cabecalho e Rodape (definidos para o mPDF) -->
    <htmlpageheader name="Header">
        <div class="header-container">
            ConectAEE - Sistema de Gestão Educacional AEE | Entrevista com Responsável
        </div>
    </htmlpageheader>
    <htmlpagefooter name="Footer">
        <div class="footer-container">
            <div class="page-number"></div>
            Gerado em <?php echo date('d/m/Y H:i'); ?> por ConectAEE
        </div>
    </htmlpagefooter>

    <h1>ENTREVISTA COM O RESPONSÁVEL</h1>
    <h2 class="document-subtitle">
        Data da Entrevista: <?php echo v($data, 'data_entrevista_formatada', date('d/m/Y')); ?>
    </h2>

    <!-- Bloco de Identificacao -->
    <div class="section">
        <div class="section-title">DADOS DE IDENTIFICAÇÃO</div>

        <?php if (!empty($data['photo_url'])): ?>
            <div class="photo-container">
                <img src="<?php echo $data['photo_url']; ?>" alt="Foto do Aluno">
            </div>
        <?php endif; ?>

        <p><span class="field-label">Nome do estudante:</span> <span class="field-value"><?php echo v($data, 'nome_estudante'); ?></span></p>

        <table class="grid-container">
            <tr>
                <td style="width:50%;"><span class="field-label">Data de Nascimento:</span> <span class="field-value"><?php echo v($data, 'data_nascimento_formatada'); ?></span></td>
                <td style="width:50%;"><span class="field-label">Naturalidade:</span> <span class="field-value"><?php echo v($data, 'naturalidade'); ?></span></td>
            </tr>
            <tr>
                <td><span class="field-label">Série/Ano:</span> <span class="field-value"><?php echo v($data, 'serie_ano'); ?></span></td>
                <td><span class="field-label">Turno:</span> <span class="field-value"><?php echo v($data, 'turno'); ?></span></td>
            </tr>
        </table>

        <p><span class="field-label">Nome da Escola:</span> <span class="field-value"><?php echo v($data, 'nome_escola'); ?></span></p>

        <table class="grid-container">
            <tr>
                <td style="width:70%;"><span class="field-label">Pai:</span> <span class="field-value"><?php echo v($data, 'nome_pai'); ?></span></td>
                <td style="width:30%;"><span class="field-label">Idade:</span> <span class="field-value"><?php echo v($data, 'idade_pai'); ?></span></td>
            </tr>
             <tr>
                <td style="width:70%;"><span class="field-label">Mãe:</span> <span class="field-value"><?php echo v($data, 'nome_mae'); ?></span></td>
                <td style="width:30%;"><span class="field-label">Idade:</span> <span class="field-value"><?php echo v($data, 'idade_mae'); ?></span></td>
            </tr>
        </table>

        <p><span class="field-label">Endereço:</span> <span class="field-value"><?php echo v($data, 'endereco_completo'); ?></span></p>

        <div class="field-row">
            <span class="field-label">Motivo da Entrevista:</span><br>
            <span class="checkbox"><?php echo (v($data, 'motivo_entrevista') == 'primeira' ? '&#9745;' : '&#9744;'); ?></span> Primeira Entrevista &nbsp;&nbsp;
            <span class="checkbox"><?php echo (v($data, 'motivo_entrevista') == 'atualizacao' ? '&#9745;' : '&#9744;'); ?></span> Atualização &nbsp;&nbsp;
            <span class="checkbox"><?php echo (v($data, 'motivo_entrevista') == 'outros' ? '&#9745;' : '&#9744;'); ?></span> Outros
        </div>
    </div>

    <!-- Outras Secoes -->
    <?php
    $sections = [
        'INFORMAÇÕES DA FAMÍLIA' => [
            'Composição da família na época da concepção:' => 'composicao_familia_concepcao',
            'Vida Social da Família:' => 'vida_social_familia',
            'Hábito Familiar:' => 'habito_familiar',
            'Benefícios sociais:' => 'beneficios_sociais',
        ],
        'GESTAÇÃO/NASCIMENTO' => [
            'A gravidez foi planejada?' => 'gravidez_planejada_relato',
            'Tipo de parto:' => 'tipo_parto',
            'Observações sobre o nascimento:' => 'observacoes_nascimento',
        ],
        'SAÚDE' => [
            'Histórico de saúde:' => 'historico_saude',
            'Acompanhamentos médicos:' => 'acompanhamentos_medicos',
        ],
        'VIDA ESCOLAR' => [
            'Histórico escolar:' => 'historico_escolar',
            'Frequenta Sala de Recursos:' => 'frequenta_sala_recursos',
            'Expectativas da família:' => 'expectativas_familia',
        ]
    ];

    foreach ($sections as $title => $fields) {
        echo '<div class="section">';
        echo '<div class="section-title">' . $title . '</div>';
        foreach ($fields as $label => $key) {
            echo '<div class="field-row">';
            echo '<span class="field-label">' . $label . '</span>';
            echo '<div class="textarea-field">' . nl2br(v($data, $key)) . '</div>';
            echo '</div>';
        }
        echo '</div>';
    }
    ?>

    <!-- Assinaturas -->
    <div class="signature-area">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label"><?php echo v($data, 'nome_entrevistador'); ?></div>
            <div class="signature-info">Entrevistador(a)</div>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label"><?php echo v($data, 'responsavel_nome'); ?></div>
            <div class="signature-info">Responsável pelo Estudante</div>
        </div>
    </div>

</body>
</html>
