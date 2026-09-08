/** Uygulamadaki ekranlar ve parametreleri (React Navigation). */
export type RootStackParamList = {
  Projects: undefined;
  ARScene: { mode?: 'new' | 'edit' } | undefined;
  Viewer: { projectId: string; name: string };
};
