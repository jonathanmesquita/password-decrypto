const API_URL = '/api';

const form = document.getElementById('decryptForm');
const encryptedInput = document.getElementById('encryptedInput');
const keyInput = document.getElementById('keyInput');
const ivGroup = document.getElementById('ivGroup');
const ivInput = document.getElementById('ivInput');
const btnAlgo3des = document.getElementById('btnAlgo3des');
const btnAlgoAes = document.getElementById('btnAlgoAes');
const loading = document.getElementById('loading');
const resultSection = document.getElementById('resultSection');
const resultValue = document.getElementById('resultValue');
const copyBtn = document.getElementById('copyBtn');
const btnClear = document.getElementById('btnClear');

let algorithm = '3des';

function setAlgorithm(next) {
  algorithm = next;
  btnAlgo3des.classList.toggle('active', algorithm === '3des');
  btnAlgoAes.classList.toggle('active', algorithm === 'aes-256-cbc');
  ivGroup.classList.toggle('hidden', algorithm !== 'aes-256-cbc');
}

btnAlgo3des.addEventListener('click', () => setAlgorithm('3des'));
btnAlgoAes.addEventListener('click', () => setAlgorithm('aes-256-cbc'));

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const encrypted = encryptedInput.value.trim();
  const key = keyInput.value.trim();
  const iv = ivInput.value.trim();

  if (!encrypted) {
    showError('Por favor, insira a senha criptografada');
    return;
  }

  if (algorithm === 'aes-256-cbc' && !iv) {
    showError('Informe o IV (16 bytes, hexadecimal ou Base64) para descriptografar com AES-256-CBC');
    return;
  }

  await decrypt(encrypted, key, iv);
});

btnClear.addEventListener('click', () => {
  form.reset();
  setAlgorithm('3des');
  resultSection.classList.add('hidden');
});

async function decrypt(encrypted, key, iv) {
  loading.classList.add('active');
  resultSection.classList.add('hidden');

  try {
    const response = await fetch(`${API_URL}/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encrypted,
        key: key || undefined,
        algorithm,
        iv: algorithm === 'aes-256-cbc' ? iv : undefined
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showSuccess(data.decrypted);
    } else {
      showError(data.error || 'Erro ao descriptografar');
    }
  } catch (error) {
    showError(`Erro: ${error.message}`);
  } finally {
    loading.classList.remove('active');
  }
}

function showSuccess(value) {
  resultValue.classList.remove('error-message');
  resultValue.textContent = value;
  resultSection.classList.remove('hidden');

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(value).then(() => {
      copyBtn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Copiado!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-copy me-2"></i>Copiar';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  };
}

function showError(message) {
  resultValue.classList.add('error-message');
  resultValue.textContent = message;
  resultSection.classList.remove('hidden');
}
