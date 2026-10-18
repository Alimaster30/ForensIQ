export interface ForensicCase {
  id: string;
  title: string;
  subtitle: string;
  verdict: 'AI GENERATED (SYNTHETIC)' | 'AUTHENTIC REAL PHOTO' | 'FACE-SWAP DEEPFAKE' | 'AUTHENTIC WITH AR RETOUCHING';
  confidence: string;
  metrics: {
    spectral_nyquist_energy: number;
    bg_sensor_noise_variance: number;
    faceswap_prob: number;
    local_anomaly_score?: number;
    inference_ms?: number;
    pipeline_tier?: string;
    dqt_compression_scale?: number;
  };
  reasons: string[];
  summary: string;
  originalImage: string;
  heatmapOverlay: string;
  fftSpectrumImage: string;
  noiseResidualImage: string;
  flaggedZones: { zone: string; intensity: number; description: string }[];
  iconType?: 'camera' | 'neural' | 'filter' | 'synthetic' | 'diffusion';
}

export const SAMPLE_CASES: ForensicCase[] = [
  {
    id: 'case-01',
    iconType: 'camera',
    title: 'Authentic Smartphone Portrait',
    subtitle: 'Natural optical camera capture against interior wall',
    verdict: 'AUTHENTIC REAL PHOTO',
    confidence: '88.0%',
    metrics: {
      spectral_nyquist_energy: 0.000398,
      bg_sensor_noise_variance: 219.22,
      faceswap_prob: 0.0074,
      inference_ms: 18.2,
      pipeline_tier: 'Tier 0 (Fast Optics & Nyquist Triage)',
      dqt_compression_scale: 1.0,
    },
    reasons: [
      'Normal optical lens rolloff (0.000398): No neural upsampler checkerboard grid artifacts detected.',
      'Physical CMOS sensor shot noise present (Noise variance: 219.22): Consistent with natural optical camera capture.',
      'Consistent corneal reflection geometry and continuous skin micro-texture.'
    ],
    summary: 'VERIFIED AS REAL: The image adheres to physical optical laws—displaying natural lens frequency attenuation, genuine CMOS photon shot noise, and continuous organic skin and anatomical geometry.',
    originalImage: '/benchmarks/case-01/original.jpg',
    heatmapOverlay: '/benchmarks/case-01/original_vit_overlay.jpg',
    fftSpectrumImage: '/benchmarks/case-01/original_fft_spectrum.jpg',
    noiseResidualImage: '/benchmarks/case-01/original_noise_residual.jpg',
    flaggedZones: [
      { zone: 'Optical Rolloff', intensity: 0.12, description: 'Natural diffraction without grid spikes' },
      { zone: 'Sensor Noise Floor', intensity: 0.88, description: 'Authentic Poisson-Gaussian shot noise' },
      { zone: 'Facial Anatomy', intensity: 0.08, description: 'Balanced biological facial landmarks' },
    ]
  },
  {
    id: 'case-02',
    iconType: 'neural',
    title: 'Photorealistic AI Male Portrait',
    subtitle: 'Generated via Latent Diffusion (Midjourney/Flux)',
    verdict: 'AI GENERATED (SYNTHETIC)',
    confidence: '83.7%',
    metrics: {
      spectral_nyquist_energy: 0.000923,
      bg_sensor_noise_variance: 25.69,
      faceswap_prob: 0.0097,
      inference_ms: 19.5,
      pipeline_tier: 'Tier 0 (Fast Optics & Nyquist Triage)',
      dqt_compression_scale: 1.0,
    },
    reasons: [
      'Spectral Nyquist checkerboard artifact detected (0.000923 vs real camera ceiling <0.000600).',
      'Periodic high-frequency grid signature characteristic of transposed convolution upsampling.',
      'Subdued CMOS sensor shot noise variance.'
    ],
    summary: 'FLAGGED AS AI GENERATED: The image displays high-frequency spectral checkerboard signatures characteristic of neural network latent decoders (Diffusion / Midjourney / Flux) and an artificially clean background devoid of physical camera sensor noise.',
    originalImage: '/benchmarks/case-02/original.jpg',
    heatmapOverlay: '/benchmarks/case-02/original_vit_overlay.jpg',
    fftSpectrumImage: '/benchmarks/case-02/original_fft_spectrum.jpg',
    noiseResidualImage: '/benchmarks/case-02/original_noise_residual.jpg',
    flaggedZones: [
      { zone: 'Nyquist Frequency Corners', intensity: 0.94, description: 'Periodic upsampler checkerboard grid' },
      { zone: 'Pupil Corneal Reflections', intensity: 0.78, description: 'Inconsistent specular environmental glints' },
      { zone: 'Hair-to-Forehead Boundary', intensity: 0.71, description: 'Diffusion blending without follicle roots' },
    ]
  },
  {
    id: 'case-03',
    iconType: 'filter',
    title: 'Real Photo with Snapchat AR Lip Filter',
    subtitle: 'Camera portrait with localized digital makeup overlay',
    verdict: 'AUTHENTIC WITH AR RETOUCHING',
    confidence: '94.9%',
    metrics: {
      spectral_nyquist_energy: 0.000355,
      bg_sensor_noise_variance: 52.66,
      faceswap_prob: 0.0022,
      local_anomaly_score: 61.06,
      inference_ms: 742.1,
      pipeline_tier: 'Tier 1 (Multi-Scale Vision Transformer Rollout)',
      dqt_compression_scale: 1.0,
    },
    reasons: [
      'Global optical capture is authentic (Nyquist 0.000355; natural camera rolloff).',
      'Genuine physical CMOS sensor shot noise present across the body and background (variance 52.66).',
      'Severe localized gradient spike on lips: Laplacian variance 61.06 vs surrounding skin 2.48.'
    ],
    summary: 'The subject and camera capture are authentic. However, a localized AR beauty filter (digital lipstick / lip smoothing) was applied to the mouth, creating an artificial 24x edge gradient discontinuity relative to surrounding facial skin.',
    originalImage: '/benchmarks/case-03/original.jpg',
    heatmapOverlay: '/benchmarks/case-03/original_vit_overlay.jpg',
    fftSpectrumImage: '/benchmarks/case-03/original_fft_spectrum.jpg',
    noiseResidualImage: '/benchmarks/case-03/original_noise_residual.jpg',
    flaggedZones: [
      { zone: 'Vermilion Lip Border', intensity: 0.96, description: 'Digital AR overlay edge discontinuity' },
      { zone: 'Surrounding Skin', intensity: 0.14, description: 'Authentic biological skin texture' },
      { zone: 'Background Noise', intensity: 0.10, description: 'Uniform smartphone CMOS noise floor' },
    ]
  },
  {
    id: 'case-04',
    iconType: 'synthetic',
    title: 'Viral Political Meme (President in Luxury Car)',
    subtitle: 'Synthetic generation circulated on social media',
    verdict: 'AI GENERATED (SYNTHETIC)',
    confidence: '99.5%',
    metrics: {
      spectral_nyquist_energy: 0.001870,
      bg_sensor_noise_variance: 0.00,
      faceswap_prob: 0.0007,
      inference_ms: 17.8,
      pipeline_tier: 'Tier 0 (Fast Optics & Nyquist Triage)',
      dqt_compression_scale: 1.42,
    },
    reasons: [
      'Spectral Nyquist energy 0.001870 (Over 3x higher than natural optical limit <0.000600).',
      'Anatomical malformation: Fused right-hand knuckles and missing joint lines.',
      'Synthetic background void (noise variance 0.0000) and warped smartphone chassis.'
    ],
    summary: 'FLAGGED AS AI GENERATED: The image displays high-frequency spectral checkerboard signatures characteristic of neural network latent decoders (Diffusion / Midjourney / Flux) and an artificially clean background devoid of physical camera sensor noise.',
    originalImage: '/benchmarks/case-04/original.jpg',
    heatmapOverlay: '/benchmarks/case-04/original_vit_overlay.jpg',
    fftSpectrumImage: '/benchmarks/case-04/original_fft_spectrum.jpg',
    noiseResidualImage: '/benchmarks/case-04/original_noise_residual.jpg',
    flaggedZones: [
      { zone: 'Hand & Knuckle Geometry', intensity: 0.98, description: 'Fused digital finger joints' },
      { zone: 'Nyquist Checkerboard', intensity: 0.95, description: 'Extreme periodic spectral energy' },
      { zone: 'Raindroplet Physics', intensity: 0.82, description: 'Uniform artificial bokeh particles' },
    ]
  },
  {
    id: 'case-05',
    iconType: 'diffusion',
    title: 'Virtual AI Influencer in Outdoor Patio',
    subtitle: 'Stable Diffusion / SDXL synthetic influencer persona',
    verdict: 'AI GENERATED (SYNTHETIC)',
    confidence: '92.3%',
    metrics: {
      spectral_nyquist_energy: 0.001392,
      bg_sensor_noise_variance: 3596.48,
      faceswap_prob: 0.0008,
      inference_ms: 18.6,
      pipeline_tier: 'Tier 0 (Fast Optics & Nyquist Triage)',
      dqt_compression_scale: 1.15,
    },
    reasons: [
      'Spectral Nyquist energy 0.001392 confirms neural latent upsampler decoders.',
      'Impossible physical geometry: Background wine glasses with detached floating stems.',
      'Deformed jewelry: Ring prongs melt directly into neighboring finger flesh.'
    ],
    summary: 'FLAGGED AS AI GENERATED: The image displays high-frequency spectral checkerboard signatures characteristic of neural network latent decoders (Diffusion / Midjourney / Flux) and an artificially clean background devoid of physical camera sensor noise.',
    originalImage: '/benchmarks/case-05/original.jpg',
    heatmapOverlay: '/benchmarks/case-05/original_vit_overlay.jpg',
    fftSpectrumImage: '/benchmarks/case-05/original_fft_spectrum.jpg',
    noiseResidualImage: '/benchmarks/case-05/original_noise_residual.jpg',
    flaggedZones: [
      { zone: 'Background Wine Glasses', intensity: 0.92, description: 'Detached floating stems and broken bases' },
      { zone: 'Finger Rings & Jewelry', intensity: 0.94, description: 'Prongs melting into neighboring flesh' },
      { zone: 'Flyaway Hair Strands', intensity: 0.85, description: 'Looping hair dissolving into foliage' },
    ]
  }
];
