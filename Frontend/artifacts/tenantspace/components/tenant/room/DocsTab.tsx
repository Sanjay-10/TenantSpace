import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Theme } from '../../../constants/theme';

export function DocsTab({ documents }: { documents: any[] }) {
  if (!documents || documents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No documents have been shared by your landlord yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {documents.map(doc => (
        <Pressable 
          key={doc.id} 
          style={styles.docCard}
          onPress={() => Linking.openURL(doc.file_url)}
        >
          <Text style={styles.docIcon}>📄</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.docName}>{doc.name}</Text>
            <Text style={styles.docDate}>
              {new Date(doc.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.downloadIcon}>↓</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, flex: 1 },
  emptyContainer: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Theme.colors.mutedFg, textAlign: 'center', lineHeight: 20 },
  docCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  docIcon: { fontSize: 24 },
  docName: { fontSize: 14, fontWeight: '600', color: Theme.colors.fg },
  docDate: { fontSize: 11, color: Theme.colors.mutedFg, marginTop: 4 },
  downloadIcon: { fontSize: 18, color: Theme.colors.primary }
});
