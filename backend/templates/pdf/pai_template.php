<?php
/**
 * Template PDF: Plano de Atendimento Individual (PAI)
 */

// Helpers
function v($data, $key, $default = '') {
    return htmlspecialchars($data[$key] ?? $default, ENT_QUOTES, 'UTF-8');
}
function render_field($label, $value) {
    return "<p><span class='field-label'>{$label}:</span> <span class='field-value'>{$value}</span></p>";
}
function render_textarea($label, $value, $small_text = '') {
    $html = "<div class='field-row'><span class='field-label'>{$label}</span>";
    if ($small_text) {
        $html .= "<br><span class='small-text'>{$small_text}</span>";
    }
    $html .= "<div class='textarea-field'>" . nl2br($value) . "</div></div>";
    return $html;
}

$css = file_get_contents(__DIR__ . '/style.css');
$pai = $data['pai'];
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Plano de Atendimento Individual (PAI)</title>
    <style><?php echo $css; ?></style>
</head>
<body>
    <htmlpageheader name="Header">
        <div class="header-container">
            ConectAEE | Plano de Atendimento Individual (PAI)
        </div>
    </htmlpageheader>
    <htmlpagefooter name="Footer">
        <div class="footer-container">
            <div class="page-number"></div>
        </div>
    </htmlpagefooter>

    <h1>PLANO DE ATENDIMENTO INDIVIDUAL (PAI)</h1>

    <!-- SEÇÃO 1 - IDENTIFICAÇÃO -->
    <div class="section">
        <div class="section-title">1. IDENTIFICAÇÃO DO ALUNO E DA EQUIPE</div>
         <?php if (!empty($data['photo_path'])): ?>
            <div class="photo-container"><img src="<?php echo $data['photo_path']; ?>" /></div>
        <?php endif; ?>
        <?php echo render_field('Nome da Escola', v($pai, 'nome_escola')); ?>
        <?php echo render_field('Nome do Estudante', v($pai, 'student_name')); ?>
        <?php echo render_field('Data de Nascimento', v($pai, 'data_nascimento_formatada')); ?>
        <?php echo render_field('Professor(a) de AEE', v($pai, 'professor_aee')); ?>
        <?php echo render_field('Período de Vigência do PAI', v($pai, 'periodo_vigencia')); ?>
    </div>

    <!-- SEÇÃO 2 - HISTÓRICO E CONTEXTUALIZAÇÃO -->
    <div class="section">
        <div class="section-title">2. HISTÓRICO DO ESTUDANTE E CONTEXTUALIZAÇÃO</div>
        <?php echo render_textarea('Histórico Escolar', v($pai, 'historico_escolar'), 'Percurso educacional, adaptações, resultados e observações relevantes.'); ?>
        <?php echo render_textarea('Interesses e Preferências', v($pai, 'interesses_preferencias'), 'O que o aluno gosta de fazer? Quais são seus pontos fortes e motivações?'); ?>
        <?php echo render_textarea('Potencialidades Observadas', v($pai, 'potencialidades_observadas'), 'Habilidades já consolidadas nas diferentes áreas de desenvolvimento.'); ?>
    </div>

    <div class="page-break"></div>

    <!-- SEÇÃO 3 - AVALIAÇÃO DIAGNÓSTICA -->
    <div class="section">
        <div class="section-title">3. AVALIAÇÃO DIAGNÓSTICA E LEVANTAMENTO DE NECESSIDADES</div>
        <?php echo render_textarea('Habilidades de Comunicação e Linguagem', v($pai, 'habilidades_comunicacao'), 'Oralidade, compreensão, expressão verbal, clareza, etc.'); ?>
        <?php echo render_textarea('Habilidades Cognitivas e Acadêmicas', v($pai, 'habilidades_cognitivas'), 'Raciocínio lógico-matemático, conceitos acadêmicos, atenção, memória.'); ?>
        <?php echo render_textarea('Habilidades Socioemocionais e Comportamentais', v($pai, 'habilidades_socioemocionais'), 'Interação social, autonomia, manejo de emoções, comportamento em sala.'); ?>
    </div>

    <div class="page-break"></div>

    <!-- SEÇÃO 4 - DEFINIÇÃO DE OBJETIVOS E METAS -->
    <div class="section">
        <div class="section-title">4. DEFINIÇÃO DE OBJETIVOS E METAS</div>
        <?php echo render_textarea('Objetivo Geral do PAI', v($pai, 'objetivo_geral'), 'O que se espera que o aluno alcance ao final do período de vigência do PAI?'); ?>
        <?php echo render_textarea('Objetivos Específicos e Metas', v($pai, 'objetivos_especificos'), 'Divididos por áreas, com metas mensuráveis (curto, médio e longo prazo).'); ?>
    </div>

    <!-- SEÇÃO 5 - ESTRATÉGIAS E RECURSOS -->
    <div class="section">
        <div class="section-title">5. ESTRATÉGIAS E RECURSOS PEDAGÓGICOS</div>
        <?php echo render_textarea('Adaptações Curriculares', v($pai, 'adaptacoes_curriculares')); ?>
        <?php echo render_textarea('Recursos Didáticos e Tecnologias Assistivas', v($pai, 'recursos_didaticos_tecnologias')); ?>
        <?php echo render_textarea('Estratégias de Ensino', v($pai, 'estrategias_ensino')); ?>
    </div>

    <!-- SEÇÃO 7 - ASSINATURAS -->
    <div class="signature-area">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label"><?php echo v($pai, 'professor_aee'); ?></div>
            <div class="signature-info">Professor(a) de AEE</div>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label"><?php echo v($pai, 'nome_responsavel'); ?></div>
            <div class="signature-info">Responsável pelo Estudante</div>
        </div>
    </div>

</body>
</html>
