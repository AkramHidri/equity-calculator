import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10
  }
});

const EquityPDFReport = ({ scenarioName, members, chartData, optionPool, startupName, startupDescription, yearOfFunding, fundingStage, logoUrl }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Image src={logoUrl} style={styles.logo} alt="Company Logo" />
        <Text>Scenario Name: {scenarioName}</Text>
        <Text>Startup Name: {startupName}</Text>
        <Text>Startup Description: {startupDescription}</Text>
        <Text>Year of Funding: {yearOfFunding}</Text>
        <Text>Funding Stage: {fundingStage}</Text>
        <Text>Option Pool: {optionPool}%</Text>
        <Text>Members:</Text>
        {members.map((member, index) => (
          <Text key={index}>
            {member.role} - {member.name}
          </Text>
        ))}
        <Text>Equity Distribution:</Text>
        {chartData.map((item, index) => (
          <Text key={index}>
            {item.name}: {item.value}%
          </Text>
        ))}
      </View>
    </Page>
  </Document>
);

export default EquityPDFReport;