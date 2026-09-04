<?php
/**
 * GenVerde · Validador de formularios
 * Acumula errores por campo y expone datos saneados.
 */
class Validator
{
    private array $data;
    private array $errors = [];

    public function __construct(array $data)
    {
        // trim de todos los strings
        $this->data = array_map(
            fn($v) => is_string($v) ? trim($v) : $v,
            $data
        );
    }

    public function required(string $field, string $label): self
    {
        $v = $this->data[$field] ?? '';
        if ($v === '' || $v === null || (is_array($v) && count($v) === 0)) {
            $this->addError($field, "El campo {$label} es obligatorio.");
        }
        return $this;
    }

    public function email(string $field, string $label = 'correo'): self
    {
        $v = $this->data[$field] ?? '';
        if ($v !== '' && !filter_var($v, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, "Ingresa un {$label} válido.");
        }
        return $this;
    }

    public function maxLen(string $field, int $max, string $label): self
    {
        $v = $this->data[$field] ?? '';
        if (is_string($v) && mb_strlen($v) > $max) {
            $this->addError($field, "El campo {$label} no puede exceder {$max} caracteres.");
        }
        return $this;
    }

    public function accepted(string $field, string $msg): self
    {
        $v = $this->data[$field] ?? '';
        if (!in_array($v, ['1', 'on', 'true', 'yes', true], true)) {
            $this->addError($field, $msg);
        }
        return $this;
    }

    /**
     * Valida una cédula dominicana (11 dígitos + dígito verificador JCE).
     */
    public function cedula(string $field, string $label = 'cédula'): self
    {
        $v = $this->data[$field] ?? '';
        if ($v === '') {
            return $this;
        }
        if (!self::validCedula($v)) {
            $this->addError($field, "La {$label} no es válida.");
        }
        return $this;
    }

    public static function validCedula(string $cedula): bool
    {
        $digits = preg_replace('/\D/', '', $cedula);
        if (strlen($digits) !== 11) {
            return false;
        }
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $mult = (int) $digits[$i] * (($i % 2 === 0) ? 1 : 2);
            if ($mult > 9) {
                $mult -= 9;
            }
            $sum += $mult;
        }
        $check = (10 - ($sum % 10)) % 10;
        return $check === (int) $digits[10];
    }

    public function addError(string $field, string $message): void
    {
        $this->errors[$field][] = $message;
    }

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function passes(): bool
    {
        return empty($this->errors);
    }

    /** Errores aplanados: ['campo' => 'primer mensaje'] */
    public function errors(): array
    {
        return array_map(fn($msgs) => $msgs[0], $this->errors);
    }

    /** Primer mensaje de error global (para flash). */
    public function firstError(): ?string
    {
        foreach ($this->errors as $msgs) {
            return $msgs[0];
        }
        return null;
    }

    public function get(string $field, $default = null)
    {
        return $this->data[$field] ?? $default;
    }

    public function all(): array
    {
        return $this->data;
    }
}
