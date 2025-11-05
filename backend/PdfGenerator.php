<?php
require_once __DIR__ . '/vendor/autoload.php';

use Mpdf\Mpdf;
use Mpdf\Output\Destination;

class PdfGenerator {
    private $mpdf;
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_left' => 15,
            'margin_right' => 15,
            'margin_top' => 20,
            'margin_bottom' => 20,
            'margin_header' => 10,
            'margin_footer' => 10
        ]);
    }

    public function setMetadata($title, $author, $subject, $keywords) {
        $this->mpdf->SetTitle($title);
        $this->mpdf->SetAuthor($author);
        $this->mpdf->SetSubject($subject);
        $this->mpdf->SetKeywords($keywords);
    }

    public function loadHtmlFromFile($filePath, $data) {
        if (!file_exists($filePath)) {
            throw new Exception("Template file not found: {$filePath}");
        }

        // Start output buffering
        ob_start();

        // Extract data variables into the current scope
        extract($data);

        // Include the template file
        include $filePath;

        // Get the contents of the buffer
        $html = ob_get_clean();

        $this->mpdf->WriteHTML($html);
    }

    public function saveToFile($filePath) {
        $directory = dirname($filePath);
        if (!file_exists($directory)) {
            mkdir($directory, 0777, true);
        }
        $this->mpdf->Output($filePath, Destination::FILE);
    }

    public function streamToBrowser($fileName) {
        $this->mpdf->Output($fileName, Destination::INLINE);
        exit;
    }

    public function downloadFile($filePath, $fileName) {
        if (file_exists($filePath)) {
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit;
        }
        throw new Exception("File not found for download: {$filePath}");
    }

    public function logDocument($type, $formId, $studentId, $teacherId, $filePath, $fileName, $title) {
        $sql = "INSERT INTO documentos_gerados
                  (tipo, form_id, student_id, teacher_id, file_path, file_name, file_size, titulo)
                  VALUES
                  (:tipo, :form_id, :student_id, :teacher_id, :file_path, :file_name, :file_size, :titulo)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':tipo' => $type,
            ':form_id' => $formId,
            ':student_id' => $studentId,
            ':teacher_id' => $teacherId,
            ':file_path' => $filePath,
            ':file_name' => $fileName,
            ':file_size' => filesize($filePath), // Assumes file has been saved
            ':titulo' => $title
        ]);
        return $this->pdo->lastInsertId();
    }
}

// Helper functions that can be used in templates
function v($data, $key, $default = '') {
    return htmlspecialchars($data[$key] ?? $default, ENT_QUOTES, 'UTF-8');
}

function checkbox($value, $expected) {
    return $value == $expected ? '☑' : '☐';
}

function sanitizeFileName($name) {
    $name = preg_replace('/[^a-zA-Z0-9\s]/', '', $name);
    $name = str_replace(' ', '_', $name);
    return substr($name, 0, 50);
}
