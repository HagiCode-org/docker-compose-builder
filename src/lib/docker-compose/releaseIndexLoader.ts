export interface CopilotCompatibilityMetadata {
  minComposeSchema: string;
  architectures: string[];
}

export interface CopilotReleaseMetadata {
  provider: 'copilot-cli';
  imageTag: string;
  imageDigest: string;
  envSchemaVersion: string;
  compatibility: CopilotCompatibilityMetadata;
}

const FALLBACK_COPILOT_METADATA: CopilotReleaseMetadata = {
  provider: 'copilot-cli',
  imageTag: '1.0.0-copilot',
  imageDigest: 'sha256:pending',
  envSchemaVersion: '1.0',
  compatibility: {
    minComposeSchema: '3.9',
    architectures: ['linux/amd64', 'linux/arm64']
  }
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function parseCopilotReleaseMetadata(payload: unknown): CopilotReleaseMetadata | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const copilot = root.copilot;
  if (!copilot || typeof copilot !== 'object') {
    return null;
  }

  const candidate = copilot as Record<string, unknown>;
  const compatibility = candidate.compatibility as Record<string, unknown> | undefined;

  if (candidate.provider !== 'copilot-cli') {
    return null;
  }

  if (
    typeof candidate.imageTag !== 'string' ||
    typeof candidate.imageDigest !== 'string' ||
    typeof candidate.envSchemaVersion !== 'string' ||
    !compatibility ||
    typeof compatibility.minComposeSchema !== 'string' ||
    !isStringArray(compatibility.architectures)
  ) {
    return null;
  }

  return {
    provider: 'copilot-cli',
    imageTag: candidate.imageTag,
    imageDigest: candidate.imageDigest,
    envSchemaVersion: candidate.envSchemaVersion,
    compatibility: {
      minComposeSchema: compatibility.minComposeSchema,
      architectures: compatibility.architectures
    }
  };
}

export async function loadCopilotReleaseMetadata(
  indexUrl: string = import.meta.env.VITE_RELEASE_INDEX_URL || 'https://server.dl.hagicode.com/index.json'
): Promise<CopilotReleaseMetadata> {
  try {
    const response = await fetch(indexUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const parsed = parseCopilotReleaseMetadata(payload);
    if (!parsed) {
      throw new Error('Invalid release metadata payload');
    }

    return parsed;
  } catch (error) {
    console.warn('[releaseIndexLoader] Failed to load copilot release metadata, using fallback.', error);
    return FALLBACK_COPILOT_METADATA;
  }
}

export function getFallbackCopilotReleaseMetadata(): CopilotReleaseMetadata {
  return FALLBACK_COPILOT_METADATA;
}
