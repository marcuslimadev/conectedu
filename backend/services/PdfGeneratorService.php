<?php
/**
 * Servico Centralizado para Geracao de PDFs
 *
 * Abstrai a logica de configuracao do mPDF, salvamento de arquivos,
 * registro no banco de dados e envio para o navegador.
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Mpdf\Mpdf;
use Mpdf\Output\Destination;

class PdfGeneratorService {
    private $pdo;
    private $user;

    public function __construct(PDO $pdo, array $user) {
        $this->pdo = $pdo;
        $this->user = $user;
    }

    /**
     * Gera, salva e envia um PDF.
     *
     * @param string $html Conteudo HTML do PDF.
     * @param array $config Configuracoes do documento.
     *      'document_type' => 'entrevista', 'pdi', ou 'pai'
     *      'student_name'  => Nome do aluno para o arquivo
     *      'form_id'       => ID do formulario
     *      'student_id'    => ID do estudante
     * @return void
     * @throws Exception Em caso de erro na geracao.
     */
    public function generate(string $html, array $config): void {
        try {
            // 1. Configurar mPDF
            $mpdf = new Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'margin_left' => 15,
                'margin_right' => 15,
                'margin_top' => 20,
                'margin_bottom' => 20,
                'margin_header' => 10,
                'margin_footer' => 10,
                'tempDir' => __DIR__ . '/../vendor/mpdf/mpdf/tmp' // Adicionado para evitar erros de permissao
            ]);

            $mpdf->SetTitle($config['title']);
            $mpdf->SetAuthor('ConectEDU - Sistema AEE');

            // 2. Escrever HTML
            $mpdf->WriteHTML($html);

            // 3. Preparar para salvar
            $uploadDir = $this->getUploadDirectory($config['document_type']);
            $fileName = $this->sanitizeFileName($config['student_name']) . '_' . date('Y-m-d') . '.pdf';
            $filePath = $uploadDir . $fileName;
            $relative_path = 'backend/uploads/documentos/' . $config['document_type'] . 's/' . $fileName;

            // 4. Salvar PDF no servidor
            $mpdf->Output($filePath, Destination::FILE);
            $fileSize = filesize($filePath);

            // 5. Registrar no banco de dados
            $this->registerDocument($config, $relative_path, $fileName, $fileSize);

            // 6. Enviar para o navegador
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            header('Content-Length: ' . $fileSize);
            readfile($filePath);
            exit;

        } catch (\Mpdf\MpdfException $e) {
            error_log('mPDF Error: ' . $e->getMessage());
            throw new Exception('Falha ao gerar PDF com mPDF: ' . $e->getMessage());
        } catch (Exception $e) {
            error_log('PDF Generation Error: ' . $e->getMessage());
            throw new Exception('Erro geral ao gerar PDF: ' . $e->getMessage());
        }
    }

    /**
     * Retorna o diretorio de upload e o cria se nao existir.
     */
    private function getUploadDirectory(string $documentType): string {
        $uploadDir = __DIR__ . '/../uploads/documentos/' . $documentType . 's/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                throw new Exception("Nao foi possivel criar o diretorio: $uploadDir");
            }
        }
        return $uploadDir;
    }

    /**
     * Registra o documento gerado no banco de dados.
     */
    private function registerDocument(array $config, string $filePath, string $fileName, int $fileSize): void {
        $sql = "INSERT INTO documentos_gerados
                  (tipo, form_id, student_id, teacher_id, file_path, file_name, file_size, titulo)
                VALUES
                  (:tipo, :form_id, :student_id, :teacher_id, :file_path, :file_name, :file_size, :titulo)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':tipo' => $config['document_type'],
            ':form_id' => $config['form_id'],
            ':student_id' => $config['student_id'],
            ':teacher_id' => $this->user['id'],
            ':file_path' => $filePath,
            ':file_name' => $fileName,
            ':file_size' => $fileSize,
            ':titulo' => $config['title']
        ]);
    }

    /**
     * Limpa o nome do arquivo para evitar caracteres invalidos.
     */
    private function sanitizeFileName(string $name): string {
        $name = preg_replace('/[^a-zA-Z0-9\s]/', '', $name);
        $name = str_replace(' ', '_', $name);
        return substr($name, 0, 50);
    }
}
