// Componente DatePicker personalizado para ConectAEE
const DatePickerComponent = {
  props: {
    modelValue: String,
    required: Boolean,
    label: String,
    placeholder: String,
    maxDate: String,
    minDate: String,
    hasError: Boolean,
    errorMessage: String
  },
  emits: ['update:modelValue'],
  template: `
    <div class="date-picker-container">
      <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      
      <div class="relative">
        <!-- Input principal com máscara -->
        <input 
          :value="displayValue"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
          type="text"
          :placeholder="placeholder || 'DD/MM/AAAA'"
          :class="inputClasses"
          maxlength="10"
          ref="textInput">
        
        <!-- Input date oculto para funcionalidade nativa -->
        <input 
          :value="modelValue"
          @input="updateValue"
          @click="openNativePicker"
          type="date"
          :max="maxDate"
          :min="minDate"
          class="absolute inset-0 opacity-0 cursor-pointer"
          ref="dateInput">
        
        <!-- Ícone de calendário -->
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      
      <!-- Mensagem de erro -->
      <p v-if="hasError && errorMessage" class="mt-2 text-sm text-red-600">
        {{ errorMessage }}
      </p>
    </div>
  `,
  data() {
    return {
      displayValue: '',
      isFocused: false
    };
  },
  computed: {
    inputClasses() {
      const base = 'w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
      const error = this.hasError ? 'border-red-300 bg-red-50' : 'border-gray-300';
      return `${base} ${error}`;
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        this.updateDisplayValue(newValue);
      }
    }
  },
  methods: {
    updateDisplayValue(dateValue) {
      if (dateValue) {
        // Converte YYYY-MM-DD para DD/MM/YYYY
        const [year, month, day] = dateValue.split('-');
        this.displayValue = `${day}/${month}/${year}`;
      } else {
        this.displayValue = '';
      }
    },
    
    handleInput(event) {
      let value = event.target.value;
      
      // Remove caracteres não numéricos
      value = value.replace(/\D/g, '');
      
      // Aplica máscara DD/MM/YYYY
      if (value.length >= 3 && value.length <= 4) {
        value = value.replace(/(\d{2})(\d+)/, '$1/$2');
      } else if (value.length >= 5) {
        value = value.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
      }
      
      // Limita a 10 caracteres (DD/MM/YYYY)
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      
      this.displayValue = value;
      
      // Se a data está completa, valida e converte
      if (value.length === 10) {
        const isoDate = this.convertToISO(value);
        if (isoDate && this.isValidDate(isoDate)) {
          this.$emit('update:modelValue', isoDate);
        }
      } else {
        this.$emit('update:modelValue', '');
      }
    },
    
    handleBlur() {
      this.isFocused = false;
      // Valida a data quando perde o foco
      if (this.displayValue.length === 10) {
        const isoDate = this.convertToISO(this.displayValue);
        if (!isoDate || !this.isValidDate(isoDate)) {
          // Se a data é inválida, limpa o campo
          this.displayValue = '';
          this.$emit('update:modelValue', '');
        }
      }
    },
    
    handleFocus() {
      this.isFocused = true;
    },
    
    updateValue(event) {
      // Atualização via input date nativo
      const value = event.target.value;
      this.$emit('update:modelValue', value);
    },
    
    convertToISO(ddmmyyyy) {
      if (!ddmmyyyy || ddmmyyyy.length !== 10) return null;
      
      const [day, month, year] = ddmmyyyy.split('/');
      
      // Valida componentes básicos
      if (!day || !month || !year || year.length !== 4) return null;
      
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    },
    
    isValidDate(isoDate) {
      const date = new Date(isoDate);
      const isValid = date instanceof Date && !isNaN(date.getTime());
      
      if (!isValid) return false;
      
      // Verifica limites se especificados
      if (this.minDate && isoDate < this.minDate) return false;
      if (this.maxDate && isoDate > this.maxDate) return false;
      
      return true;
    },
    
    openNativePicker() {
      // Força a abertura do picker nativo
      if (this.$refs.dateInput) {
        this.$refs.dateInput.focus();
        this.$refs.dateInput.showPicker && this.$refs.dateInput.showPicker();
      }
    }
  }
};

// Componente será registrado no spa-tailwind.js usando Vue 3
// app.component('DatePicker', DatePickerComponent);