/**
 * FieldNote On-Device Intelligence Engine
 * 
 * Executes entirely inside browser client via WebGPU / WebAssembly (WASM).
 * Complies with Rule 7f: Does not claim NPU access. Local ML pipeline.
 */

export interface EngineCapabilities {
  hasWebGPU: boolean;
  hasWasmSIMD: boolean;
  activeBackend: 'webgpu' | 'wasm' | 'unsupported';
  isModelLoaded: boolean;
}

export async function detectEngineCapabilities(): Promise<EngineCapabilities> {
  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator && !!navigator.gpu;
  
  let hasWasmSIMD = false;
  try {
    // 0x00, 0x61, 0x73, 0x6d (magic) + 0x01, 0x00, 0x00, 0x00 (version)
    hasWasmSIMD = typeof WebAssembly !== 'undefined' && WebAssembly.validate(new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 125, 0, 0, 0, 0, 11
    ]));
  } catch {
    hasWasmSIMD = false;
  }

  const activeBackend = hasWebGPU ? 'webgpu' : hasWasmSIMD ? 'wasm' : 'unsupported';

  return {
    hasWebGPU,
    hasWasmSIMD,
    activeBackend,
    isModelLoaded: false,
  };
}
