'use strict';

// Elementos da página
const video = document.getElementById('cameraVideo');
const placeholder = document.getElementById('cameraPlaceholder');
const cameraStatus = document.getElementById('cameraStatus');

const toggleCameraButton = document.getElementById('toggleCameraButton');
const captureButton = document.getElementById('captureButton');
const downloadButton = document.getElementById('downloadButton');

const studentNameInput = document.getElementById('studentName');
const photoFilterSelect = document.getElementById('photoFilter');

const filterTitle = document.getElementById('filterTitle');
const filterDescription = document.getElementById('filterDescription');
const filterPreviewArt = document.getElementById('filterPreviewArt');

const cameraMessage = document.getElementById('cameraMessage');
const resultEmpty = document.getElementById('resultEmpty');
const resultFigure = document.getElementById('resultFigure');
const capturedImage = document.getElementById('capturedImage');
const captureCaption = document.getElementById('captureCaption');

// Variáveis de controle
let cameraStream = null;
let latestImageUrl = null;
let originalPhotoCanvas = null;
let lastCaptureInfo = null;
let renderVersion = 0;

// Filtros disponíveis
const filters = {
  amber: {
    name: 'Âmbar',
    description: 'Sépia + contraste suave',
    css: 'sepia(0.48) contrast(1.08) saturate(1.12)'
  },

  grayscale: {
    name: 'Preto e branco',
    description: 'Tons de cinza',
    css: 'grayscale(1) contrast(1.08)'
  },

  invert: {
    name: 'Cores invertidas',
    description: 'Cores invertidas',
    css: 'invert(1)'
  },

  vintage: {
    name: 'Vintage',
    description: 'Sépia com aparência antiga',
    css: 'sepia(0.7) contrast(1.15) saturate(0.8)'
  },

  original: {
    name: 'Original',
    description: 'Sem filtro visual',
    css: 'none'
  }
};

// Mostra mensagens para o usuário
function showMessage(message, type = '') {
  cameraMessage.textContent = message;

  cameraMessage.className = `message${type ? ` ${type}` : ''}`;
}

// Retorna o filtro selecionado
function getSelectedFilter() {
  return filters[photoFilterSelect.value] || filters.amber;
}

// Atualiza as informações visuais do filtro
function updateFilterInformation() {
  const selected = getSelectedFilter();

  filterTitle.textContent = selected.name;
  filterDescription.textContent = selected.description;

  const previewFilters = {
    amber: 'sepia(0.65) contrast(1.08)',
    grayscale: 'grayscale(1)',
    invert: 'invert(1)',
    vintage: 'sepia(0.8) contrast(1.1) saturate(0.8)',
    original: 'none'
  };

  filterPreviewArt.style.filter =
    previewFilters[photoFilterSelect.value] || 'none';
}

// Atualiza a interface conforme o estado da câmera
function setCameraInterface(isOn) {
  cameraStatus.classList.toggle('status-on', isOn);
  cameraStatus.classList.toggle('status-off', !isOn);

  cameraStatus.innerHTML = isOn
    ? '<span class="status-dot"></span>Câmera ligada'
    : '<span class="status-dot"></span>Câmera desligada';

  toggleCameraButton.innerHTML = isOn
    ? '<span aria-hidden="true">⏻</span> Desligar câmera'
    : '<span aria-hidden="true">⏻</span> Ligar câmera';

  toggleCameraButton.setAttribute(
    'aria-label',
    isOn ? 'Desligar câmera' : 'Ligar câmera'
  );

  captureButton.disabled = !isOn;
  video.hidden = !isOn;
  placeholder.hidden = isOn;
}

// Liga a câmera
async function startCamera() {
  if (
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== 'function'
  ) {
    showMessage(
      'Este navegador não oferece acesso à câmera. Abra a página em localhost ou HTTPS.',
      'error'
    );
    return;
  }

  toggleCameraButton.disabled = true;
  showMessage('Solicitando acesso à câmera…');

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: 'user'
        }
      },
      audio: false
    });

    video.srcObject = cameraStream;

    await video.play();

    setCameraInterface(true);

    showMessage(
      'Câmera pronta. Digite seu nome e capture a foto.',
      'success'
    );

  } catch (error) {
    stopCamera(false);

    if (
      error.name === 'NotAllowedError' ||
      error.name === 'SecurityError'
    ) {
      showMessage(
        'Permissão negada. Autorize o uso da câmera nas permissões do navegador e tente novamente.',
        'error'
      );

    } else if (
      error.name === 'NotFoundError' ||
      error.name === 'DevicesNotFoundError'
    ) {
      showMessage(
        'Nenhuma câmera foi encontrada neste dispositivo.',
        'error'
      );

    } else if (
      error.name === 'NotReadableError' ||
      error.name === 'TrackStartError'
    ) {
      showMessage(
        'A câmera pode estar sendo usada por outro aplicativo. Feche-o e tente novamente.',
        'error'
      );

    } else {
      showMessage(
        `Não foi possível iniciar a câmera (${error.message || 'erro desconhecido'}). Verifique a permissão e tente novamente.`,
        'error'
      );
    }

  } finally {
    toggleCameraButton.disabled = false;
  }
}

// Desliga a câmera e libera os recursos
function stopCamera(showStatus = true) {
  if (cameraStream) {
    // Encerra todas as faixas do stream.
    cameraStream.getTracks().forEach((track) => {
      track.stop();
    });

    cameraStream = null;
  }

  video.pause();
  video.srcObject = null;

  setCameraInterface(false);

  if (showStatus) {
    showMessage(
      'Câmera desligada e recursos liberados. Você pode ligá-la novamente quando quiser.'
    );
  }
}

// Ajusta o tamanho do texto para caber na imagem
function fitTextSize(
  context,
  text,
  maxWidth,
  startingSize,
  minSize = 14
) {
  let size = startingSize;

  while (size > minSize) {
    context.font = `700 ${size}px Arial, sans-serif`;

    if (context.measureText(text).width <= maxWidth) {
      break;
    }

    size -= 1;
  }

  return size;
}

// Formata a data e a hora
function formatCaptureDate(date) {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Processa a fotografia com o filtro selecionado
function renderProcessedPhoto() {
  if (!originalPhotoCanvas || !lastCaptureInfo) {
    return;
  }

  const currentRender = ++renderVersion;
  const selectedFilter = getSelectedFilter();

  const { studentName, formattedDate } = lastCaptureInfo;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    showMessage(
      'Não foi possível processar a foto no Canvas.',
      'error'
    );
    return;
  }

  const width = originalPhotoCanvas.width;
  const height = originalPhotoCanvas.height;

  canvas.width = width;
  canvas.height = height;

  // Aplica o filtro à fotografia original.
  // A cada alteração, o efeito é reaplicado do zero.
  context.filter = selectedFilter.css;

  context.drawImage(
    originalPhotoCanvas,
    0,
    0,
    width,
    height
  );

  // Remove o filtro antes de desenhar os textos.
  context.filter = 'none';

  // Cria a faixa inferior para facilitar a leitura.
  const bandHeight = Math.max(
    94,
    Math.round(height * 0.19)
  );

  const bandY = height - bandHeight;

  const gradient = context.createLinearGradient(
    0,
    bandY,
    0,
    height
  );

  gradient.addColorStop(
    0,
    'rgba(13, 18, 31, 0.64)'
  );

  gradient.addColorStop(
    1,
    'rgba(13, 18, 31, 0.94)'
  );

  context.fillStyle = gradient;

  context.fillRect(
    0,
    bandY,
    width,
    bandHeight
  );

  // Prepara o nome do aluno
  const horizontalPadding = Math.max(
    20,
    Math.round(width * 0.045)
  );

  const textMaxWidth = width - horizontalPadding * 2;

  const nameFontSize = fitTextSize(
    context,
    studentName,
    textMaxWidth,
    Math.max(20, Math.round(height * 0.047)),
    14
  );

  // Grava o nome na imagem com fillText()
  context.font = `700 ${nameFontSize}px Arial, sans-serif`;
  context.fillStyle = '#ffffff';
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';

  context.fillText(
    studentName,
    horizontalPadding,
    bandY + Math.round(bandHeight * 0.48),
    textMaxWidth
  );

  // Grava a data e a hora na imagem com fillText()
  const dateFontSize = Math.max(
    12,
    Math.round(height * 0.025)
  );

  context.font = `400 ${dateFontSize}px Arial, sans-serif`;
  context.fillStyle = '#d8e0f0';

  context.fillText(
    `CAPTURADO EM  ${formattedDate}`,
    horizontalPadding,
    bandY + Math.round(bandHeight * 0.77),
    textMaxWidth
  );

  // Converte o Canvas em uma imagem PNG
  canvas.toBlob((blob) => {
    // Evita que uma renderização antiga substitua a mais recente.
    if (currentRender !== renderVersion) {
      return;
    }

    if (!blob) {
      showMessage(
        'Não foi possível gerar a imagem. Tente novamente.',
        'error'
      );
      return;
    }

    // Libera o endereço da imagem anterior
    if (latestImageUrl) {
      URL.revokeObjectURL(latestImageUrl);
    }

    latestImageUrl = URL.createObjectURL(blob);

    // Atualiza a imagem exibida na página
    capturedImage.src = latestImageUrl;

    resultEmpty.hidden = true;
    resultFigure.hidden = false;
    downloadButton.disabled = false;

    captureCaption.textContent =
      `Captura de ${studentName} · ${formattedDate} · filtro ${selectedFilter.name}`;

    showMessage(
      `Foto atualizada com o filtro ${selectedFilter.name}. Você pode trocar o filtro novamente ou baixar o PNG.`,
      'success'
    );

  }, 'image/png');
}

// Captura a fotografia original da câmera
function capturePhoto() {
  if (
    !cameraStream ||
    video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
    !video.videoWidth ||
    !video.videoHeight
  ) {
    showMessage(
      'Ligue a câmera e aguarde a imagem aparecer antes de capturar.',
      'error'
    );
    return;
  }

  const studentName = studentNameInput.value.trim();

  if (!studentName) {
    studentNameInput.focus();

    showMessage(
      'Digite o nome do aluno antes de capturar a foto.',
      'error'
    );
    return;
  }

  // Guarda uma cópia original sem filtro.
  // Ela será utilizada sempre que o filtro for alterado.
  const rawCanvas = document.createElement('canvas');
  const rawContext = rawCanvas.getContext('2d');

  if (!rawContext) {
    showMessage(
      'Não foi possível preparar a foto no Canvas.',
      'error'
    );
    return;
  }

  rawCanvas.width = video.videoWidth;
  rawCanvas.height = video.videoHeight;

  // Espelha a imagem para corresponder à prévia da câmera frontal.
  rawContext.save();

  rawContext.translate(rawCanvas.width, 0);
  rawContext.scale(-1, 1);

  rawContext.drawImage(
    video,
    0,
    0,
    rawCanvas.width,
    rawCanvas.height
  );

  rawContext.restore();

  // Registra o momento exato da captura.
  const capturedAt = new Date();

  originalPhotoCanvas = rawCanvas;

  lastCaptureInfo = {
    studentName,
    capturedAt,
    formattedDate: formatCaptureDate(capturedAt)
  };

  // Aplica o filtro atualmente selecionado.
  renderProcessedPhoto();
}

// Baixa a foto em PNG
function downloadPhoto() {
  if (!latestImageUrl) {
    showMessage(
      'Capture uma foto antes de fazer o download.',
      'error'
    );
    return;
  }

  const studentName = lastCaptureInfo
    ? lastCaptureInfo.studentName
    : 'aluno';

  // Prepara um nome de arquivo seguro.
  const safeName = studentName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'aluno';

  const link = document.createElement('a');

  link.href = latestImageUrl;
  link.download = `camera-pfe-${safeName}.png`;

  document.body.appendChild(link);

  link.click();
  link.remove();
}

// Quando o seletor muda, atualiza a prévia e a fotografia.
photoFilterSelect.addEventListener('change', () => {
  updateFilterInformation();

  if (originalPhotoCanvas && lastCaptureInfo) {
    // Já existe uma foto: troca o filtro sem nova captura.
    renderProcessedPhoto();

  } else {
    showMessage(
      `Filtro ${getSelectedFilter().name} selecionado. Ele será usado na próxima captura.`
    );
  }
});

// Botão para ligar ou desligar a câmera
toggleCameraButton.addEventListener('click', () => {
  if (cameraStream) {
    stopCamera();
  } else {
    startCamera();
  }
});

// Botão de captura
captureButton.addEventListener('click', capturePhoto);

// Botão de download
downloadButton.addEventListener('click', downloadPhoto);

// Encerra a câmera quando a página é encerrada ou abandonada.
window.addEventListener('pagehide', () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => {
      track.stop();
    });

    cameraStream = null;
  }

  if (latestImageUrl) {
    URL.revokeObjectURL(latestImageUrl);
    latestImageUrl = null;
  }
});

// Inicializa a aplicação
updateFilterInformation();
setCameraInterface(false);