<?php
// backend/templates/partials/pdi-comunicacao.php
$pdi = $data['pdi'];
?>
<div class="section">
    <div class="section-title">VIII. COMUNICAÇÃO E LINGUAGEM</div>

    <div class="field-row"><span class="field-label">1. Apresenta intenção comunicativa:</span>
        <?php echo checkbox(v($pdi, 'intencao_comunicativa'), 'sim'); ?> Sim &nbsp;
        <?php echo checkbox(v($pdi, 'intencao_comunicativa'), 'nao'); ?> Não
    </div>

    <div class="field-row" style="margin-top: 8px;"><span class="field-label">2. Utiliza a comunicação:</span><br>
        <?php
        $utiliza_com = explode(',', v($pdi, 'utiliza_comunicacao'));
        $opcoes_utiliza = ['comentarios' => 'para fazer comentários', 'solicitacoes' => 'para fazer solicitações', 'necessidades_basicas' => 'para necessidades básicas', 'obter_atencao' => 'para obter atenção', 'realizar_escolhas' => 'realizar escolhas', 'pequenas_narrativas' => 'realizar pequenas narrativas'];
        foreach ($opcoes_utiliza as $key => $label) {
            echo "<div style='margin-left: 10px;'>" . checkbox(in_array($key, $utiliza_com) ? $key : '', $key) . " {$label}</div>";
        }
        ?>
    </div>

    <div class="field-row" style="margin-top: 8px;"><span class="field-label">3. Recursos utilizados para Comunicação Suplementar Alternativa:</span><br>
        <?php
        $recursos = explode(',', v($pdi, 'recursos_comunicacao_alternativa'));
        $opcoes_recursos = ['alfabeto_movel' => 'Alfabeto Móvel', 'alta_tecnologia' => 'Alta Tecnologia', 'baixa_tecnologia' => 'Baixa Tecnologia', 'figuras_avulsas' => 'Figuras Avulsas', 'fotos' => 'Fotos', 'numerais' => 'Numerais', 'nao_faz_uso' => 'Não Faz uso de nenhum recurso suplementar', 'pictograma' => 'Pictograma', 'prancha_comunicacao' => 'Prancha de Comunicação', 'prancha_tematica' => 'Prancha Temática'];
        foreach ($opcoes_recursos as $key => $label) {
             echo "<div style='margin-left: 10px;'>" . checkbox(in_array($key, $recursos) ? $key : '', $key) . " {$label}</div>";
        }
        ?>
    </div>

    <div class="field-row" style="margin-top: 8px;"><span class="field-label">4. Expressa-se por/como/com:</span><br>
        <?php
        $expressa = explode(',', v($pdi, 'expressa_se_por'));
        $opcoes_expressao = ['gestos_caseiros' => 'Gestos caseiros', 'libras' => 'Língua de Sinais Brasileira - Libras', 'palavras' => 'Palavras', 'sons' => 'Sons', 'timidez' => 'Demonstra timidez ao se expressar', 'descreve_gravuras' => 'Descreve gravuras', 'ecolalia' => 'Ecolalia', 'clareza' => 'Expressa-se com clareza', 'rapido' => 'Expressa-se muito rápido', 'som_final' => 'Expressa-se pelo som final das palavras', 'frases_completas' => 'Frases completas', 'frases_curtas' => 'Frases curtas', 'gagueira' => 'Gagueira', 'lentidao' => 'Lentidão na fala', 'nomeia_objetos' => 'Nomeia objetos', 'omite_fonemas' => 'Omite fonemas', 'troca_fonemas' => 'Troca fonemas', 'distorce_fonemas' => 'Distorce fonemas', 'conversa_espontanea' => 'Conversa espontaneamente', 'reconta_historias' => 'Reconta histórias', 'repete_adultos' => 'Repete a fala dos adultos', 'entende_proposto' => 'Demonstra entender o que é proposto', 'voz_baixa' => 'Tom de voz baixo', 'voz_alta' => 'Tom de voz alto'];
        echo "<table><tr>";
        $count = 0;
        foreach ($opcoes_expressao as $key => $label) {
            echo "<td style='width: 50%; border: none;'>" . checkbox(in_array($key, $expressa) ? $key : '', $key) . " {$label}</td>";
            $count++;
            if ($count % 2 == 0) echo "</tr><tr>";
        }
        echo "</tr></table>";
        ?>
    </div>

    <div class="field-row" style="margin-top: 8px; page-break-before: always;"><span class="field-label">5. Escrita:</span><br>
        <?php
        $escrita = explode(',', v($pdi, 'escrita_nivel'));
        $opcoes_escrita = ['garatujas' => 'Garatujas', 'pre_silabica' => 'Escrita pré-silábica', 'silabica' => 'Escrita silábica', 'silabica_alfabetica' => 'Escrita silábica-alfabética', 'alfabetica' => 'Escrita alfabética', 'diferencia_desenho' => 'Diferencia desenho da escrita e dos números', 'identifica_rotulos' => 'Identifica rótulos', 'conhece_algumas_letras' => 'Conhece algumas letras', 'conhece_todas_letras' => 'Conhece todas as letras', 'identifica_letras_iguais' => 'Identifica letras iguais', 'letra_inicial_nome' => 'Reconhece a letra inicial do seu nome', 'reconhece_nome_frases' => 'Reconhece seu nome em frases', 'nome_pais_colegas' => 'Reconhece o nome dos pais e colegas', 'escreve_nomes' => 'Escreve nome de familiares e amigos', 'relaciona_partes_nomes' => 'Observa e relaciona parte dos nomes', 'forma_palavras' => 'Procura formar palavras e tenta ler', 'escreve_frases' => 'Escreve frases', 'escreve_textos' => 'Escreve textos', 'letra_cursiva' => 'Letra cursiva', 'letra_impressa' => 'Letra impressa', 'letra_legivel' => 'Letra legível', 'relaciona_letras' => 'Relaciona letras de vários tipos e tamanhos', 'sentido_texto' => 'Tenta atribuir um sentido num texto por meio de pistas', 'escreve_com_apoio' => 'Escreve com apoio/adaptação', 'recusa_escrever' => 'Recusa escrever dizendo que não sabe'];
        echo "<table><tr>";
        $count = 0;
        foreach ($opcoes_escrita as $key => $label) {
            echo "<td style='width: 50%; border: none;'>" . checkbox(in_array($key, $escrita) ? $key : '', $key) . " {$label}</td>";
            $count++;
            if ($count % 2 == 0) echo "</tr><tr>";
        }
        echo "</tr></table>";
        ?>
    </div>

    <div class="field-row" style="margin-top: 8px;"><span class="field-label">6. Leitura:</span><br>
         <?php
        $leitura = explode(',', v($pdi, 'leitura_nivel'));
        $opcoes_leitura = ['le_palavras' => 'Lê palavras', 'le_frases' => 'Lê frases', 'le_textos' => 'Lê textos', 'leitura_global' => 'Leitura global (compreensão, inferência, comparação)', 'leitura_fonetica' => 'Leitura fonética (silabada) com dificuldade no entendimento', 'imita_leitura' => 'É capaz de imitar a leitura a partir de um texto conhecido oralmente', 'nao' => 'Não lê'];
        foreach ($opcoes_leitura as $key => $label) {
            echo "<div style='margin-left: 10px;'>" . checkbox(in_array($key, $leitura) ? $key : '', $key) . " {$label}</div>";
        }
        ?>
    </div>
</div>
