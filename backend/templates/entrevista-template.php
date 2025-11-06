<?php
// backend/templates/entrevista-template.php

// Incluir o cabeçalho
include __DIR__ . '/partials/header.php';

// --- Preparação de dados específicos do template ---

// Foto do aluno
$fotoHtml = '';
if (!empty($data['photo_url'])) {
    $fotoPath = __DIR__ . '/../../' . $data['photo_url']; // Corrigido o caminho
    if (file_exists($fotoPath)) {
        $fotoHtml = '<img src="' . $fotoPath . '" class="student-photo">';
    }
}
?>

<!-- DADOS DE IDENTIFICAÇÃO -->
<div class="section">
    <div class="section-title">DADOS DE IDENTIFICAÇÃO</div>

    <?php echo $fotoHtml; ?>

    <div class="field-row">
        <span class="field-label">Nome do estudante:</span>
        <span class="field-value"><?php echo v($data, 'nome_estudante'); ?></span>
    </div>

    <div class="grid-2">
        <div class="grid-col">
            <span class="field-label">Data de Nascimento:</span>
            <span class="field-value"><?php echo v($data, 'data_nascimento_formatada'); ?></span>
        </div>
        <div class="grid-col">
            <span class="field-label">Naturalidade:</span>
            <span class="field-value"><?php echo v($data, 'naturalidade'); ?></span>
        </div>
    </div>

    <div class="field-row">
        <span class="field-label">Nome da Escola:</span>
        <span class="field-value"><?php echo v($data, 'nome_escola'); ?></span>
    </div>

    <div class="grid-2">
        <div class="grid-col">
            <span class="field-label">Série/Ano:</span>
            <span class="field-value"><?php echo v($data, 'serie_ano'); ?></span>
        </div>
        <div class="grid-col">
            <span class="field-label">Turno:</span>
            <span class="field-value"><?php echo v($data, 'turno'); ?></span>
        </div>
    </div>

    <div class="grid-2">
        <div class="grid-col">
            <span class="field-label">Pai:</span>
            <span class="field-value"><?php echo v($data, 'nome_pai'); ?></span>
        </div>
        <div class="grid-col">
            <span class="field-label">Idade:</span>
            <span class="field-value"><?php echo v($data, 'idade_pai'); ?></span>
        </div>
    </div>

    <div class="grid-2">
        <div class="grid-col">
            <span class="field-label">Mãe:</span>
            <span class="field-value"><?php echo v($data, 'nome_mae'); ?></span>
        </div>
        <div class="grid-col">
            <span class="field-label">Idade:</span>
            <span class="field-value"><?php echo v($data, 'idade_mae'); ?></span>
        </div>
    </div>

    <div class="field-row">
        <span class="field-label">Endereço:</span>
        <span class="field-value"><?php echo v($data, 'endereco'); ?></span>
    </div>

    <div class="grid-2">
        <div class="grid-col">
            <span class="field-label">Bairro:</span>
            <span class="field-value"><?php echo v($data, 'bairro'); ?></span>
        </div>
        <div class="grid-col">
            <span class="field-label">Cidade:</span>
            <span class="field-value"><?php echo v($data, 'cidade'); ?></span>
        </div>
    </div>

    <div class="field-row">
        <span class="field-label">Motivo da Entrevista:</span><br>
        <span class="checkbox"><?php echo checkbox(v($data, 'motivo_entrevista'), 'primeira'); ?></span> Primeira Entrevista &nbsp;&nbsp;
        <span class="checkbox"><?php echo checkbox(v($data, 'motivo_entrevista'), 'atualizacao'); ?></span> Atualização da Entrevista &nbsp;&nbsp;
        <span class="checkbox"><?php echo checkbox(v($data, 'motivo_entrevista'), 'outros'); ?></span> Outros
    </div>
</div>

<!-- INFORMAÇÕES DA FAMÍLIA -->
<div class="section">
    <div class="section-title">INFORMAÇÕES DA FAMÍLIA</div>

    <div class="field-row">
        <span class="field-label">Composição da família na época da concepção:</span>
        <div class="textarea-field"><?php echo v($data, 'composicao_familia_concepcao'); ?></div>
    </div>

    <div class="field-row">
        <span class="field-label">Vida Social da Família:</span>
        <div class="textarea-field"><?php echo v($data, 'vida_social_familia'); ?></div>
    </div>

    <div class="field-row">
        <span class="field-label">Hábito Familiar:</span>
        <div class="textarea-field"><?php echo v($data, 'habito_familiar'); ?></div>
    </div>

    <div class="field-row">
        <span class="field-label">Benefícios sociais:</span>
        <div class="textarea-field"><?php echo v($data, 'beneficios_sociais'); ?></div>
    </div>
</div>

<!-- GESTAÇÃO/NASCIMENTO -->
<div class="section">
    <div class="section-title">GESTAÇÃO/NASCIMENTO</div>

    <div class="field-row">
        <span class="field-label">A gravidez foi planejada?</span>
        <div class="textarea-field"><?php echo v($data, 'gravidez_planejada_relato'); ?></div>
    </div>

    <div class="field-row">
        <span class="field-label">Tipo de parto:</span>
        <span class="field-value"><?php echo v($data, 'tipo_parto'); ?></span>
    </div>

    <div class="field-row">
        <span class="field-label">Observações sobre o nascimento:</span>
        <div class="textarea-field"><?php echo v($data, 'observacoes_nascimento'); ?></div>
    </div>
</div>

<!-- ALIMENTAÇÃO -->
<div class="section">
    <div class="section-title">ALIMENTAÇÃO</div>

    <div class="field-row">
        <span class="field-label">Foi amamentado?</span>
        <span class="checkbox"><?php echo checkbox(v($data, 'foi_amamentado'), 1); ?></span> Sim &nbsp;&nbsp;
        <span class="checkbox"><?php echo checkbox(v($data, 'foi_amamentado'), 0); ?></span> Não
    </div>

    <div class="field-row">
        <span class="field-label">Até que idade:</span>
        <span class="field-value"><?php echo v($data, 'amamentacao_ate_idade'); ?></span>
    </div>

    <div class="field-row">
        <span class="field-label">Alimentação atual:</span>
        <div class="textarea-field"><?php echo v($data, 'alimentacao_atual'); ?></div>
    </div>
</div>

<!-- SAÚDE -->
<div class="section">
    <div class="section-title">SAÚDE</div>

    <div class="field-row">
        <span class="field-label">Histórico de saúde:</span>
        <div class="textarea-field"><?php echo v($data, 'historico_saude'); ?></div>
    </div>

    <div class="field-row">
        <span class="field-label">Acompanhamentos médicos:</span>
        <div class="textarea-field"><?php echo v($data, 'acompanhamentos_medicos'); ?></div>
    </div>
</div>

<!-- DESENVOLVIMENTO -->
<div class="section">
    <div class="section-title">DESENVOLVIMENTO PREGRESSO</div>

    <div class="grid-2">
        <div class="grid-col">
            <span class="field-label">Idade que andou:</span>
            <span class="field-value"><?php echo v($data, 'idade_andou'); ?></span>
        </div>
        <div class="grid-col">
            <span class="field-label">Idade que falou:</span>
            <span class="field-value"><?php echo v($data, 'idade_falou'); ?></span>
        </div>
    </div>
</div>

<!-- COMUNICAÇÃO -->
<div class="section">
    <div class="section-title">DESENVOLVIMENTO ATUAL (Comunicação)</div>

    <div class="field-row">
        <span class="field-label">Como se comunica:</span>
        <div class="textarea-field"><?php echo v($data, 'como_se_comunica'); ?></div>
    </div>
</div>

<!-- VIDA ESCOLAR -->
<div class="section">
    <div class="section-title">VIDA ESCOLAR</div>

    <div class="field-row">
        <span class="field-label">Histórico escolar:</span>
        <div class="textarea-field"><?php echo v($data, 'historico_escolar'); ?></div>
    </div>

    <div class="field-row">
        <span class="field-label">Frequenta Sala de Recursos:</span>
        <span class="field-value"><?php echo v($data, 'frequenta_sala_recursos'); ?></span>
    </div>

    <div class="field-row">
        <span class="field-label">Expectativas da família:</span>
        <div class="textarea-field"><?php echo v($data, 'expectativas_familia'); ?></div>
    </div>
</div>

<!-- ASSINATURAS -->
<div class="signature-box">
    <div style="display:inline-block; margin: 0 30px;">
        <div class="signature-line"></div>
        <div><?php echo v($data, 'nome_entrevistador'); ?></div>
        <div style="font-size:9pt;">Entrevistador(a)</div>
    </div>

    <div style="display:inline-block; margin: 0 30px;">
        <div class="signature-line"></div>
        <div><?php echo v($data, 'responsavel_nome'); ?></div>
        <div style="font-size:9pt;">Responsável</div>
    </div>
</div>

<?php
// Incluir o rodapé
include __DIR__ . '/partials/footer.php';
?>
