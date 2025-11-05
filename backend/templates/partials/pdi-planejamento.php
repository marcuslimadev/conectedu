<?php
// backend/templates/partials/pdi-planejamento.php

$planejamento = $data['planejamento_bimestral'] ?? [];
$pdi = $data['pdi'];
?>

<div class="section">
    <div class="section-title">IX. PLANEJAMENTO BIMESTRAL</div>

    <p><strong>ESTUDANTE:</strong> <?php echo v($pdi, 'nome_aluno'); ?> &nbsp;&nbsp; <strong>TURMA:</strong> <?php echo v($pdi, 'ano_escolaridade'); ?></p>

    <?php
    $disciplinas = $planejamento['disciplinas'] ?? [];
    if (empty($disciplinas)) {
        $disciplinas_padrao = ['ARTE', 'LÍNGUA PORTUGUESA', 'MATEMÁTICA', 'CIÊNCIAS', 'HISTÓRIA', 'GEOGRAFIA', 'EDUCAÇÃO FÍSICA'];
        foreach ($disciplinas_padrao as $disc) {
            $disciplinas[$disc] = ['bimestres' => []];
        }
    }

    foreach ($disciplinas as $nome_disciplina => $dados_disciplina):
        for ($bimestre = 1; $bimestre <= 4; $bimestre++):
            $dados_bim = $dados_disciplina['bimestres'][$bimestre] ?? [];
    ?>
            <div class="section" style="margin-top: 15px; page-break-inside: avoid;">
                <h3 style="font-size: 10pt; font-weight: bold; background-color: #f0f0f0; padding: 3px;">
                    DISCIPLINA: <?php echo v($nome_disciplina); ?> &nbsp;&nbsp; PROFESSOR(A): <?php echo v($dados_bim, 'professor'); ?>
                </h3>
                <p><strong>BIMESTRE:</strong>
                    <?php for ($i = 1; $i <= 4; $i++): ?>
                        <span class="checkbox"><?php echo $i == $bimestre ? '☑' : '☐'; ?></span> <?php echo $i; ?>º &nbsp;
                    <?php endfor; ?>
                </p>

                <div class="field-row"><span class="field-label">Objetivo geral da disciplina para a turma:</span><div class="textarea-field"><?php echo nl2br(v($dados_bim, 'objetivo_turma')); ?></div></div>
                <div class="field-row"><span class="field-label">Objetivo geral da disciplina para o(a) estudante:</span><div class="textarea-field"><?php echo nl2br(v($dados_bim, 'objetivo_estudante')); ?></div></div>

                <table style="margin-top: 8px; font-size: 9pt;">
                    <tr>
                        <th style='width: 25%'>Qual o conteúdo será trabalhado?</th>
                        <th style='width: 25%'>Qual a habilidade a ser construída/desenvolvida?</th>
                        <th style='width: 25%'>Metodologia e materiais</th>
                        <th style='width: 25%'>Habilidade/aprendizado adquirida</th>
                    </tr>
                    <?php
                    $conteudos = $dados_bim['conteudos'] ?? [['conteudo' => '', 'habilidade' => '', 'metodologia' => '', 'aprendizado' => '']]; // Garantir ao menos uma linha
                    foreach ($conteudos as $conteudo):
                    ?>
                        <tr>
                            <td><?php echo nl2br(v($conteudo, 'conteudo')); ?></td>
                            <td><?php echo nl2br(v($conteudo, 'habilidade')); ?></td>
                            <td><?php echo nl2br(v($conteudo, 'metodologia')); ?></td>
                            <td><?php echo nl2br(v($conteudo, 'aprendizado')); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </table>
            </div>
    <?php
        endfor;
        // Quebra de página após cada disciplina completa
        echo "<div style='page-break-after: always;'></div>";
    endforeach;
    ?>

    <!-- Tabela de Avaliações -->
    <h3 style="font-size: 11pt; font-weight: bold; margin-top: 20px;">AVALIAÇÕES BIMESTRAIS</h3>
    <?php
    $disciplinas_avaliacao = [
        'ARTE', 'LÍNGUA PORTUGUESA', 'GEOGRAFIA', 'HISTÓRIA',
        'EDUCAÇÃO FÍSICA', 'MATEMÁTICA', 'BIOLOGIA OU CIÊNCIAS',
        'FÍSICA', 'QUÍMICA', 'SOCIOLOGIA', 'ENSINO RELIGIOSO',
        'ITINERÁRIOS FORMATIVOS P.VIDA', 'ITINERÁRIOS FORMATIVOS',
    ];

    for ($bimestre = 1; $bimestre <= 4; $bimestre++):
    ?>
        <h4 style="font-size: 10pt; font-weight: bold;"><?php echo $bimestre; ?>º BIMESTRE</h4>
        <table style="font-size: 8pt;">
            <tr>
                <th style='width: 20%'>Disciplina</th>
                <th style='width: 8%'>Valor</th>
                <th style='width: 8%'>Nota</th>
                <th style='width: 18%'>Grau de autonomia</th>
                <th style='width: 23%'>Metodologia de avaliação</th>
                <th style='width: 23%'>Diagnóstico pedagógico</th>
            </tr>
            <?php
            foreach ($disciplinas_avaliacao as $disciplina):
                $aval = $planejamento['avaliacoes'][$bimestre][$disciplina] ?? [];
            ?>
                <tr>
                    <td><?php echo $disciplina; ?></td>
                    <td style='text-align: center'><?php echo v($aval, 'valor'); ?></td>
                    <td style='text-align: center'><?php echo v($aval, 'nota'); ?></td>
                    <td style='font-size: 7pt'>
                        <?php echo checkbox(v($aval, 'autonomia'), 'muito_suporte'); ?> muito suporte<br>
                        <?php echo checkbox(v($aval, 'autonomia'), 'alta_compreensao'); ?> alta compreensão<br>
                        <?php echo checkbox(v($aval, 'autonomia'), 'pouco_suporte'); ?> pouco suporte<br>
                        <?php echo checkbox(v($aval, 'autonomia'), 'pouca_compreensao'); ?> pouca compreensão
                    </td>
                    <td><?php echo nl2br(v($aval, 'metodologia')); ?></td>
                    <td><?php echo nl2br(v($aval, 'diagnostico')); ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
        <?php if ($bimestre < 4) echo "<div style='page-break-after: always;'></div>"; ?>
    <?php endfor; ?>
</div>
