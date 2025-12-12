<?php
/**
 * GERADOR DE PDF - ENTREVISTA COM RESPONSÁVEL V3
 * Layout EXATO do modelo oficial ENTREVISTA COM O RESPONSÁVEL.txt
 */

// Dependências
if (!function_exists('db')) {
    require_once 'functions.php';
}
if (!class_exists('Mpdf\Mpdf')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use Mpdf\Mpdf;

// Se chamado diretamente
if (!isset($user) || !isset($pdo)) {
    header('Content-Type: application/json; charset=utf-8');
    cors();
    $user = require_auth();
    $pdo = db();
}

$entrevista_id = $_GET['id'] ?? null;
if (!$entrevista_id) {
    res(false, null, 'ID da entrevista não fornecido', 400);
}

try {
    // Buscar dados da entrevista
    $sql = "SELECT e.*, s.name as student_name, s.photo_url, s.birth_date, 
                   sch.name as school_name
            FROM entrevista_forms e
            LEFT JOIN students s ON e.student_id = s.id
            LEFT JOIN schools sch ON s.school_id = sch.id
            WHERE e.id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $entrevista_id]);
    $entrevista = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$entrevista) {
        res(false, null, 'Entrevista não encontrada', 404);
    }
    
    // Verificar permissões
    if ($user['role'] !== 'admin' && $entrevista['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Sem permissão', 403);
    }
    
    // Decodificar form_data JSON
    $d = json_decode($entrevista['form_data'], true) ?? [];
    
    // Helpers
    function v($arr, $key, $default = '') {
        $val = $arr[$key] ?? $default;
        return htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
    }
    
    function check($arr, $key) {
        return !empty($arr[$key]) ? '☑' : '☐';
    }
    
    function data_br($data) {
        if (empty($data) || $data == '0000-00-00') return '___/___/______';
        try {
            return date('d/m/Y', strtotime($data));
        } catch (Exception $e) {
            return '___/___/______';
        }
    }
    
    function campo($label, $valor = '') {
        $v = $valor ? htmlspecialchars($valor, ENT_QUOTES, 'UTF-8') : '';
        return '<span class="label">' . $label . '</span><div class="field-box" style="min-height:18px;">' . $v . '</div>';
    }
    
    function texto($label, $valor = '') {
        $v = $valor ? nl2br(htmlspecialchars($valor, ENT_QUOTES, 'UTF-8')) : '';
        return '<span class="label">' . $label . '</span><div class="field-box" style="min-height:30px;">' . $v . '</div>';
    }
    
    // Configurar mPDF
    $mpdf = new Mpdf([
        'mode' => 'utf-8',
        'format' => 'A4',
        'margin_left' => 20,
        'margin_right' => 20,
        'margin_top' => 15,
        'margin_bottom' => 15,
    ]);
    
    $student_name = v($d, 'nome_estudante') ?: ($entrevista['student_name'] ?? 'Aluno');
    $mpdf->SetTitle('Entrevista com Responsável - ' . $student_name);
    $mpdf->SetAuthor('ConectEDU - Sistema AEE');
    
    // CSS Global
    $css = '<style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 9pt; line-height: 1.4; color: #000; }
        h1 { text-align: center; color: #1a5490; font-size: 13pt; font-weight: bold; margin: 10px 0; }
        .data-entrevista { text-align: right; font-size: 9pt; margin: 0 0 10px 0; }
        .secao { font-size: 11pt; font-weight: bold; margin: 12px 0 5px 0; padding: 3px 5px; background: #e8f0f8; border-left: 4px solid #1a5490; }
        .bordered { width: 100%; border-collapse: collapse; margin: 5px 0; }
        .bordered td { border: 2px solid #000; padding: 5px; vertical-align: top; }
        .label { font-weight: bold; font-size: 8pt; display: block; margin-bottom: 2px; }
        .field-box { border: 1px solid #666; padding: 4px; background: #fff; min-height: 25px; }
    </style>';
    
    // Extrair valores
    $data_entrevista = data_br(v($d, 'data_entrevista'));
    
    // HTML do documento
    $html = $css;
    $html .= '<h1>ENTREVISTA COM O RESPONSÁVEL</h1>';
    $html .= '<div class="data-entrevista">Data da Entrevista: ' . $data_entrevista . '</div>';
    
    // ==================== DADOS DE IDENTIFICAÇÃO ====================
    $html .= '<div class="secao">DADOS DE IDENTIFICAÇÃO</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td>' . campo('Nome do estudante:', v($d, 'nome_estudante') ?: $entrevista['student_name']) . '</td></tr>';
    $html .= '<tr><td style="width:50%;">' . campo('Data de Nascimento:', data_br(v($d, 'data_nascimento'))) . '</td>';
    $html .= '<td>' . campo('Naturalidade:', v($d, 'naturalidade')) . '</td></tr>';
    $html .= '<tr><td>' . campo('Nome da Escola:', v($d, 'nome_escola') ?: $entrevista['school_name']) . '</td></tr>';
    $html .= '<tr><td style="width:40%;">' . campo('Série/Ano:', v($d, 'serie_ano')) . '</td>';
    $html .= '<td>' . campo('Turno:', v($d, 'turno')) . '</td></tr>';
    $html .= '<tr><td style="width:60%;">' . campo('Pai:', v($d, 'nome_pai')) . '</td>';
    $html .= '<td style="width:20%;">' . campo('Idade:', v($d, 'idade_pai')) . '</td>';
    $html .= '<td>' . campo('Escolaridade:', v($d, 'escolaridade_pai')) . '</td></tr>';
    $html .= '<tr><td style="width:60%;">' . campo('Mãe:', v($d, 'nome_mae')) . '</td>';
    $html .= '<td style="width:20%;">' . campo('Idade:', v($d, 'idade_mae')) . '</td>';
    $html .= '<td>' . campo('Escolaridade:', v($d, 'escolaridade_mae')) . '</td></tr>';
    $html .= '<tr><td>' . campo('Endereço:', v($d, 'endereco')) . '</td></tr>';
    $html .= '<tr><td style="width:40%;">' . campo('Bairro:', v($d, 'bairro')) . '</td>';
    $html .= '<td style="width:30%;">' . campo('Cidade:', v($d, 'cidade')) . '</td>';
    $html .= '<td>' . campo('Tel.:', v($d, 'telefone')) . '</td></tr>';
    
    $html .= '<tr><td colspan="3"><span class="label">Motivo da Entrevista:</span><div class="field-box">';
    $html .= check($d, 'motivo_primeira_entrevista') . ' Primeira Entrevista &nbsp;&nbsp; ';
    $html .= check($d, 'motivo_atualizacao') . ' Atualização Da Entrevista &nbsp;&nbsp; ';
    $html .= check($d, 'motivo_outros') . ' Outros</div></td></tr>';
    $html .= '</table>';
    
    // ==================== INFORMAÇÕES DA FAMÍLIA ====================
    $html .= '<div class="secao">INFORMAÇÕES DA FAMÍLIA</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td>' . texto('Como era composta a família na época da concepção da criança:', v($d, 'composicao_familiar')) . '</td></tr>';
    $html .= '<tr><td style="width:30%;">' . campo('Tem Irmãos:', v($d, 'tem_irmaos')) . '</td>';
    $html .= '<td style="width:30%;">' . campo('Quantos:', v($d, 'quantos_irmaos')) . '</td>';
    $html .= '<td>' . campo('Quais as idades:', v($d, 'idades_irmaos')) . '</td></tr>';
    $html .= '<tr><td>' . campo('Os pais continuam casados? Se separados são presentes?', v($d, 'situacao_pais')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Vida Social da Família (amigos, festas, passeios, moradia, nível econômico) Faça um relato:', v($d, 'vida_social_familia')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Como é o hábito familiar do estudante? (Relatar como é o dia a dia do estudante):', v($d, 'habito_familiar')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Benefícios sociais? Bolsa Família / BPC/ Passe Livre/ Outros - Relate quais benefícios a família Recebe:', v($d, 'beneficios_sociais')) . '</td></tr>';
    $html .= '</table>';
    
    // ==================== GESTAÇÃO/NASCIMENTO ====================
    $html .= '<div class="secao">GESTAÇÃO/NASCIMENTO</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td>' . texto('A gravidez foi planejada pelos pais? (Relate):', v($d, 'gravidez_planejada')) . '</td></tr>';
    $html .= '<tr><td>' . texto('A gestação foi uma experiência agradável para a mãe?', v($d, 'gestacao_agradavel')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Como foi a saúde da mãe?', v($d, 'saude_mae')) . '</td></tr>';
    $html .= '<tr><td>' . texto('E o estado emocional?', v($d, 'estado_emocional_mae')) . '</td></tr>';
    $html .= '<tr><td style="width:30%;">' . campo('Fez Pré-natal:', v($d, 'fez_prenatal')) . '</td>';
    $html .= '<td style="width:35%;">' . campo('Mês que começou:', v($d, 'mes_inicio_prenatal')) . '</td>';
    $html .= '<td>' . campo('Foi necessário algum tratamento:', v($d, 'tratamento_prenatal')) . '</td></tr>';
    
    if (v($d, 'tratamento_prenatal') == 'sim') {
        $html .= '<tr><td colspan="3">' . campo('Qual:', v($d, 'qual_tratamento_prenatal')) . '</td></tr>';
    }
    
    $html .= '<tr><td style="width:50%;">' . campo('Nascimento – Tipo de parto:', v($d, 'tipo_parto')) . '</td>';
    $html .= '<td>' . campo('Nasceu no tempo normal?', v($d, 'nasceu_tempo_normal')) . '</td></tr>';
    $html .= '<tr><td colspan="2">' . texto('Observações:', v($d, 'observacoes_nascimento')) . '</td></tr>';
    
    $html .= '<tr><td colspan="2"><span class="label">O bebê ao nascer:</span><div class="field-box">';
    $html .= check($d, 'bebe_necessitou_oxigenio') . ' necessitou oxigênio &nbsp;&nbsp; ';
    $html .= check($d, 'bebe_teve_convulsao') . ' teve convulsão &nbsp;&nbsp; ';
    $html .= check($d, 'bebe_ictericia') . ' icterícia &nbsp;&nbsp; ';
    $html .= check($d, 'bebe_incubadora') . ' incubadora</div></td></tr>';
    $html .= '</table>';
    
    // ==================== ALIMENTAÇÃO ====================
    $html .= '<div class="secao">ALIMENTAÇÃO</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td style="width:40%;">' . campo('Foi amamentado?', v($d, 'foi_amamentado')) . '</td>';
    $html .= '<td>' . campo('Até que idade?', v($d, 'amamentado_ate_idade')) . '</td></tr>';
    $html .= '<tr><td colspan="2">' . texto('Teve problemas com alimentação?', v($d, 'problemas_alimentacao')) . '</td></tr>';
    $html .= '<tr><td colspan="2">' . texto('Alimentação atual:', v($d, 'alimentacao_atual')) . '</td></tr>';
    $html .= '</table>';
    
    // ==================== SAÚDE ====================
    $html .= '<div class="secao">SAÚDE</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td>' . campo('Deficiência informada:', v($d, 'deficiencia_informada')) . '</td></tr>';
    $html .= '<tr><td style="width:40%;">' . campo('Faz uso de medicamento?', v($d, 'uso_medicamento')) . '</td>';
    $html .= '<td style="width:30%;">' . campo('Nome:', v($d, 'nome_medicamento')) . '</td>';
    $html .= '<td>' . campo('Quais horários:', v($d, 'horarios_medicamento')) . '</td></tr>';
    $html .= '<tr><td colspan="3">' . texto('A Vacinação está atualizada (Relate):', v($d, 'vacinacao_atualizada')) . '</td></tr>';
    $html .= '<tr><td colspan="3">' . texto('Teve alguma doença infectocontagiosa na infância? Qual:', v($d, 'doenca_infancia')) . '</td></tr>';
    
    $html .= '<tr><td colspan="3"><span class="label">Histórico de saúde:</span><div class="field-box">';
    $html .= check($d, 'convulsoes') . ' Convulsões &nbsp;&nbsp; ';
    $html .= check($d, 'cirurgias') . ' Cirurgias &nbsp;&nbsp; ';
    $html .= check($d, 'acidentes') . ' Acidentes &nbsp;&nbsp; ';
    $html .= check($d, 'alergias') . ' Alergias<br>';
    $html .= check($d, 'febre_alta') . ' Febre Alta recorrente &nbsp;&nbsp; ';
    $html .= check($d, 'problemas_audicao') . ' Problemas com a audição &nbsp;&nbsp; ';
    $html .= check($d, 'problemas_visao') . ' Problemas de visão</div></td></tr>';
    
    $html .= '<tr><td colspan="3">' . texto('Algum tratamento: Médico responsável? Qual? Especialidade:', v($d, 'tratamento_medico')) . '</td></tr>';
    $html .= '<tr><td colspan="3">' . texto('Atualmente faz algum tratamento ou acompanhamento com profissional específico? Qual?', v($d, 'acompanhamento_atual')) . '</td></tr>';
    
    $html .= '<tr><td style="width:50%;">' . campo('Apresenta crises rotineiramente?', v($d, 'crises_rotineiramente')) . '</td>';
    $html .= '<td>' . campo('Tem convulsões?', v($d, 'tem_convulsoes')) . '</td></tr>';
    
    if (v($d, 'tem_convulsoes') == 'sim') {
        $html .= '<tr><td colspan="2">' . campo('Quando foi a primeira convulsão?', v($d, 'primeira_convulsao_quando')) . '</td></tr>';
        $html .= '<tr><td colspan="2">' . campo('Qual o último episódio?', v($d, 'ultima_convulsao')) . '</td></tr>';
        $html .= '<tr><td colspan="2">' . campo('Acontece de quanto em quanto tempo?', v($d, 'frequencia_convulsoes')) . '</td></tr>';
        $html .= '<tr><td colspan="2">' . texto('Como a família lida com os episódios?', v($d, 'familia_lida_convulsoes')) . '</td></tr>';
        $html .= '<tr><td colspan="2">' . texto('Caso tenha crises, qual as mudanças que você analisou após as convulsões?', v($d, 'mudancas_apos_convulsoes')) . '</td></tr>';
    }
    $html .= '</table>';
    
    // ==================== DESENVOLVIMENTO PREGRESSO ====================
    $html .= '<div class="secao">DESENVOLVIMENTO PREGRESSO</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td style="width:33%;">' . campo('Idade em que engatinhou:', v($d, 'idade_engatinhou')) . '</td>';
    $html .= '<td style="width:33%;">' . campo('Idade em que andou:', v($d, 'idade_andou')) . '</td>';
    $html .= '<td>' . campo('Idade em que falou:', v($d, 'idade_falou')) . '</td></tr>';
    $html .= '<tr><td colspan="3">' . campo('Controle dos esfíncteres:', v($d, 'controle_esfincteres')) . '</td></tr>';
    $html .= '</table>';
    
    // ==================== DESENVOLVIMENTO ATUAL (Comunicação) ====================
    $html .= '<div class="secao">DESENVOLVIMENTO ATUAL (Comunicação)</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td>' . texto('Apresenta comunicação verbal?', v($d, 'comunicacao_verbal')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Alguma dificuldade na fala:', v($d, 'dificuldade_fala')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Caso não seja oralizado apresenta outro tipo de comunicação?', v($d, 'outro_tipo_comunicacao')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Como você se comunica com seu filho(a):', v($d, 'como_se_comunica')) . '</td></tr>';
    $html .= '</table>';
    
    // ==================== ATIVIDADES DE VIDA DIÁRIA ====================
    $html .= '<div class="secao">ATIVIDADES DE VIDA DIÁRIA</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td>' . campo('Alimenta de forma independente?', v($d, 'alimenta_independente')) . '</td></tr>';
    $html .= '<tr><td>' . campo('Faz uso do banheiro de forma independente?', v($d, 'banheiro_independente')) . '</td></tr>';
    $html .= '<tr><td>' . campo('Gerencia coisas do seu dia a dia (material escolar, remédio etc.)?', v($d, 'gerencia_dia_a_dia')) . '</td></tr>';
    
    $html .= '<tr><td><span class="label">Sono:</span><div class="field-box">';
    $html .= check($d, 'sono_dorme_bem') . ' dorme bem, calmo (noite inteira) &nbsp;&nbsp; ';
    $html .= check($d, 'sono_agitado') . ' agitado, tem pesadelos &nbsp;&nbsp; ';
    $html .= check($d, 'sono_contraturno') . ' dorme no contraturno</div></td></tr>';
    
    $html .= '<tr><td>' . texto('Gosta de brincar? Brinquedos e brincadeiras de preferência:', v($d, 'gosta_brincar')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Apresenta curiosidade sexual? Se masturba? Com frequência? Recebe orientação sexual?', v($d, 'curiosidade_sexual')) . '</td></tr>';
    
    $html .= '<tr><td><span class="label">Como a criança é corrigida?</span><div class="field-box">';
    $html .= check($d, 'correcao_conversa') . ' conversa &nbsp;&nbsp; ';
    $html .= check($d, 'correcao_grita') . ' grita &nbsp;&nbsp; ';
    $html .= check($d, 'correcao_castigo') . ' põe de castigo &nbsp;&nbsp; ';
    $html .= check($d, 'correcao_bate') . ' bate &nbsp;&nbsp; ';
    $html .= check($d, 'correcao_outro') . ' outro: ' . v($d, 'correcao_outro_qual') . '</div></td></tr>';
    
    $html .= '<tr><td>' . texto('Como ela lida com a negativa/desejo imediatamente?', v($d, 'lida_negativa')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Tem preferência por algum tipo de objeto/brinquedo/história ou algo similar? (hiperfoco?)', v($d, 'preferencia_hiperfoco')) . '</td></tr>';
    $html .= '</table>';
    
    // ==================== SOCIALIZAÇÃO E PREFERÊNCIAS ====================
    $html .= '<div class="secao">SOCIALIZAÇÃO E PREFERÊNCIAS</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td style="width:50%;">' . campo('Faz amigos com facilidade?', v($d, 'faz_amigos_facilidade')) . '</td>';
    $html .= '<td>' . campo('Tem amigos na vizinhança?', v($d, 'tem_amigos_vizinhanca')) . '</td></tr>';
    $html .= '<tr><td style="width:50%;">' . campo('Interage com crianças da mesma idade?', v($d, 'interage_mesma_idade')) . '</td>';
    $html .= '<td>' . campo('Gosta de passeios e festas?', v($d, 'gosta_passeios_festas')) . '</td></tr>';
    $html .= '<tr><td colspan="2">' . texto('Preferências de diversão:', v($d, 'preferencias_diversao')) . '</td></tr>';
    $html .= '</table>';
    
    // ==================== COMPORTAMENTO ====================
    $html .= '<div class="secao">COMPORTAMENTO</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td><span class="label">Características comportamentais:</span><div class="field-box">';
    $html .= check($d, 'comportamento_introvertido') . ' introvertido &nbsp;&nbsp; ';
    $html .= check($d, 'comportamento_afetuoso') . ' afetuoso &nbsp;&nbsp; ';
    $html .= check($d, 'comportamento_obediente') . ' obediente &nbsp;&nbsp; ';
    $html .= check($d, 'comportamento_resistente') . ' resistente<br>';
    $html .= check($d, 'comportamento_cooperador') . ' cooperador &nbsp;&nbsp; ';
    $html .= check($d, 'comportamento_medroso') . ' medroso &nbsp;&nbsp; ';
    $html .= check($d, 'comportamento_inseguro') . ' inseguro &nbsp;&nbsp; ';
    $html .= check($d, 'comportamento_outro') . ' Outro: ' . v($d, 'comportamento_outro_qual') . '</div></td></tr>';
    $html .= '<tr><td>' . texto('Tem algum hábito/mania?', v($d, 'habito_mania')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Como comporta diante da frustração:', v($d, 'comporta_frustracao')) . '</td></tr>';
    $html .= '</table>';
    
    // ==================== VIDA ESCOLAR ====================
    $html .= '<div class="secao">VIDA ESCOLAR</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td>' . campo('Idade em que entrou na escola:', v($d, 'idade_entrou_escola')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Como foi a adaptação:', v($d, 'adaptacao_escola')) . '</td></tr>';
    $html .= '<tr><td>' . campo('Repetência:', v($d, 'repetencia')) . '</td></tr>';
    $html .= '<tr><td>' . campo('Se ressente quando muda o professor(a)?', v($d, 'ressente_muda_professor')) . '</td></tr>';
    $html .= '<tr><td>' . campo('Frequência escolar:', v($d, 'frequencia_escolar')) . '</td></tr>';
    $html .= '<tr><td>' . texto('A família participa da vida escolar do filho(a)?', v($d, 'familia_participa_escola')) . '</td></tr>';
    $html .= '<tr><td>' . texto('De que forma?', v($d, 'forma_participacao_escola')) . '</td></tr>';
    $html .= '<tr><td>' . campo('Quem ajuda no Para Casa?', v($d, 'quem_ajuda_para_casa')) . '</td></tr>';
    $html .= '<tr><td>' . texto('O que acha do atendimento da escola?', v($d, 'acha_atendimento_escola')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Acha que o desenvolvimento da criança é compatível com a sua idade?', v($d, 'desenvolvimento_compativel_idade')) . '</td></tr>';
    $html .= '<tr><td>' . texto('Há antecedentes familiares com problemas de saúde ou aprendizagem (mentais, alcoolismo, sindrômicos, outros)?', v($d, 'antecedentes_familiares')) . '</td></tr>';
    $html .= '<tr><td style="width:50%;">' . campo('Frequenta Sala de Recursos?', v($d, 'frequenta_sala_recursos')) . '</td>';
    $html .= '<td>' . campo('Qual a frequência do atendimento?', v($d, 'frequencia_sala_recursos')) . '</td></tr>';
    $html .= '</table>';
    
    // ==================== ALGUMA INFORMAÇÃO COMPLEMENTAR ====================
    $html .= '<div class="secao">ALGUMA INFORMAÇÃO COMPLEMENTAR</div>';
    $html .= '<table class="bordered">';
    $html .= '<tr><td>' . texto('Observação: todas as informações, comentários espontâneos que julgar importante devem ser anotados pelo entrevistador.', v($d, 'informacoes_complementares')) . '</td></tr>';
    $html .= '</table>';
    $html .= '<div style="margin-top:30px;">';
    $html .= '<div style="text-align:center;border-top:1px solid #000;width:50%;margin:0 auto;padding-top:5px;">';
    $html .= 'Nome e função do entrevistador</div>';
    $html .= '<br><br>';
    $html .= '<div style="text-align:center;border-top:1px solid #000;width:50%;margin:0 auto;padding-top:5px;">';
    $html .= 'Nome e parentesco do Responsável pelas informações</div>';
    $html .= '</div>';
    
    // Renderizar PDF
    $mpdf->WriteHTML($html);
    
    // Salvar arquivo
    $dir = __DIR__ . '/uploads/documentos/entrevistas/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    
    $filename = 'entrevista_' . $entrevista['student_id'] . '_' . $entrevista_id . '_' . date('YmdHis') . '.pdf';
    $filepath = $dir . $filename;
    $mpdf->Output($filepath, \Mpdf\Output\Destination::FILE);
    
    // Registrar em documentos_gerados
    $doc_sql = "INSERT INTO documentos_gerados (tipo, student_id, form_id, file_path, file_name, teacher_id, created_at) 
                VALUES ('entrevista', :student_id, :form_id, :file_path, :file_name, :teacher_id, NOW())";
    $doc_stmt = $pdo->prepare($doc_sql);
    $doc_stmt->execute([
        ':student_id' => $entrevista['student_id'],
        ':form_id' => $entrevista_id,
        ':file_path' => $filepath,
        ':file_name' => $filename,
        ':teacher_id' => $user['id']
    ]);
    
    // Retornar para download
    $mpdf->Output($filename, \Mpdf\Output\Destination::DOWNLOAD);
    
} catch (PDOException $e) {
    error_log('[PDF-ENTREVISTA-V3] Erro SQL: ' . $e->getMessage());
    error_log('[PDF-ENTREVISTA-V3] SQL State: ' . $e->getCode());
    res(false, null, 'Erro ao gerar PDF: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log('[PDF-ENTREVISTA-V3] Erro: ' . $e->getMessage());
    res(false, null, 'Erro ao gerar PDF: ' . $e->getMessage(), 500);
}
