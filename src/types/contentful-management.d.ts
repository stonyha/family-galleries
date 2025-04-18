declare module 'contentful-management' {
  export interface ClientConfig {
    accessToken: string;
    [key: string]: any;
  }

  export interface Space {
    getEnvironment(environmentId: string): Promise<Environment>;
    [key: string]: any;
  }

  export interface Environment {
    createUpload(config: {
      file: Buffer;
      contentType: string;
      fileName: string;
    }): Promise<Upload>;
    createAsset(asset: any): Promise<Asset>;
    getEntry(entryId: string): Promise<Entry>;
    [key: string]: any;
  }

  export interface Upload {
    sys: {
      id: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface Asset {
    sys: {
      id: string;
      [key: string]: any;
    };
    fields: {
      title: Record<string, string>;
      description: Record<string, string>;
      file: Record<string, {
        url: string;
        contentType: string;
        fileName: string;
        [key: string]: any;
      }>;
      [key: string]: any;
    };
    processForAllLocales(): Promise<Asset>;
    publish(): Promise<Asset>;
    [key: string]: any;
  }

  export interface Entry {
    sys: {
      id: string;
      [key: string]: any;
    };
    fields: {
      [key: string]: any;
    };
    update(): Promise<Entry>;
    publish(): Promise<Entry>;
    [key: string]: any;
  }

  export function createClient(config: ClientConfig): {
    getSpace(spaceId: string): Promise<Space>;
    [key: string]: any;
  };
} 