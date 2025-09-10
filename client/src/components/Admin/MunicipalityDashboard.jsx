import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, CheckCircle, XCircle, AlertOctagon } from 'lucide-react';

const MunicipalityDashboard = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch flood reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['floodReports'],
    queryFn: async () => {
      const { data } = await axios.get('/api/flood-reports');
      return data;
    }
  });

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await axios.get('/api/alerts');
      return data;
    }
  });

  // Verify report mutation
  const verifyReportMutation = useMutation({
    mutationFn: async ({ reportId, status, notes }) => {
      const { data } = await axios.patch(`/api/flood-reports/${reportId}/verify`, {
        status,
        notes
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['floodReports']);
      toast({
        title: 'Report verified',
        status: 'success',
        duration: 3000
      });
    }
  });

  // Update alert mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ alertId, status }) => {
      const { data } = await axios.patch(`/api/alerts/${alertId}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts']);
      toast({
        title: 'Alert updated',
        status: 'success',
        duration: 3000
      });
    }
  });

  // Stats calculation
  const stats = {
    totalReports: reports?.length || 0,
    pendingReports: reports?.filter(r => r.verificationStatus === 'pending').length || 0,
    criticalAlerts: alerts?.filter(a => a.severity === 'critical').length || 0,
    activeAlerts: alerts?.filter(a => !a.resolved).length || 0
  };

  return (
    <Box p={4}>
      <Heading mb={6}>Municipality Dashboard</Heading>

      {/* Stats Overview */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Reports</StatLabel>
              <StatNumber>{stats.totalReports}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                23% increase
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pending Reports</StatLabel>
              <StatNumber>{stats.pendingReports}</StatNumber>
              <StatHelpText>Requires verification</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Critical Alerts</StatLabel>
              <StatNumber>{stats.criticalAlerts}</StatNumber>
              <StatHelpText>High priority</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Alerts</StatLabel>
              <StatNumber>{stats.activeAlerts}</StatNumber>
              <StatHelpText>Needs attention</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Report Moderation</Tab>
          <Tab>Alert Management</Tab>
          <Tab>Analytics</Tab>
        </TabList>

        <TabPanels>
          {/* Report Moderation Panel */}
          <TabPanel>
            <ReportModerationPanel
              reports={reports}
              isLoading={reportsLoading}
              onVerify={verifyReportMutation.mutate}
              selectedReport={selectedReport}
              setSelectedReport={setSelectedReport}
            />
          </TabPanel>

          {/* Alert Management Panel */}
          <TabPanel>
            <AlertManagementPanel
              alerts={alerts}
              isLoading={alertsLoading}
              onUpdateAlert={updateAlertMutation.mutate}
            />
          </TabPanel>

          {/* Analytics Panel */}
          <TabPanel>
            <AnalyticsPanel reports={reports} alerts={alerts} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Report Moderation Panel Component
const ReportModerationPanel = ({
  reports,
  isLoading,
  onVerify,
  selectedReport,
  setSelectedReport
}) => {
  const [verificationNotes, setVerificationNotes] = useState('');

  if (isLoading) {
    return <Box>Loading reports...</Box>;
  }

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
      {/* Reports List */}
      <Box>
        <Heading size="md" mb={4}>Pending Reports</Heading>
        {reports?.filter(report => report.verificationStatus === 'pending')
          .map(report => (
            <Card
              key={report._id}
              mb={4}
              cursor="pointer"
              onClick={() => setSelectedReport(report)}
              bg={selectedReport?._id === report._id ? 'gray.100' : 'white'}
            >
              <CardBody>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">{report.location.address}</Text>
                    <Text fontSize="sm" color="gray.600">
                      Reported by: {report.reportedBy.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Severity: {report.severity}
                    </Text>
                  </Box>
                  <Box>
                    {report.severity === 'critical' && (
                      <AlertOctagon color="red" />
                    )}
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          ))}
      </Box>

      {/* Report Details and Verification */}
      <Box>
        {selectedReport ? (
          <Box>
            <Heading size="md" mb={4}>Report Details</Heading>
            <Card mb={4}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Location</Text>
                    <Text>{selectedReport.location.address}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Description</Text>
                    <Text>{selectedReport.description}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Water Level</Text>
                    <Text>{selectedReport.waterLevel}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Impact</Text>
                    <Text>
                      Affected People: {selectedReport.impact?.affectedPeople || 'N/A'}
                      <br />
                      Damaged Properties: {selectedReport.impact?.damagedProperties || 'N/A'}
                    </Text>
                  </Box>
                  {selectedReport.mediaFiles?.length > 0 && (
                    <Box>
                      <Text fontWeight="bold">Media Files</Text>
                      <SimpleGrid columns={2} spacing={2}>
                        {selectedReport.mediaFiles.map((file, index) => (
                          <Image
                            key={index}
                            src={file}
                            alt={`Report media ${index + 1}`}
                            borderRadius="md"
                          />
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                  <FormControl>
                    <FormLabel>Verification Notes</FormLabel>
                    <Textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Add verification notes..."
                    />
                  </FormControl>
                  <ButtonGroup spacing={4}>
                    <Button
                      leftIcon={<CheckCircle />}
                      colorScheme="green"
                      onClick={() => {
                        onVerify({
                          reportId: selectedReport._id,
                          status: 'verified',
                          notes: verificationNotes
                        });
                        setVerificationNotes('');
                        setSelectedReport(null);
                      }}
                    >
                      Verify
                    </Button>
                    <Button
                      leftIcon={<XCircle />}
                      colorScheme="red"
                      onClick={() => {
                        onVerify({
                          reportId: selectedReport._id,
                          status: 'disputed',
                          notes: verificationNotes
                        });
                        setVerificationNotes('');
                        setSelectedReport(null);
                      }}
                    >
                      Dispute
                    </Button>
                  </ButtonGroup>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        ) : (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">Select a report to view details</Text>
          </Box>
        )}
      </Box>
    </Grid>
  );
};

// Alert Management Panel Component
const AlertManagementPanel = ({ alerts, isLoading, onUpdateAlert }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertNotes, setAlertNotes] = useState('');
  const [alertStatus, setAlertStatus] = useState('active');

  if (isLoading) {
    return <Box>Loading alerts...</Box>;
  }

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
      {/* Alerts List */}
      <Box>
        <Heading size="md" mb={4}>Active Alerts</Heading>
        {alerts?.filter(alert => alert.status === 'active')
          .map(alert => (
            <Card
              key={alert._id}
              mb={4}
              cursor="pointer"
              onClick={() => setSelectedAlert(alert)}
              bg={selectedAlert?._id === alert._id ? 'gray.100' : 'white'}
              borderLeft="4px"
              borderLeftColor={alert.severity === 'critical' ? 'red.500' : 
                             alert.severity === 'high' ? 'orange.500' : 
                             alert.severity === 'medium' ? 'yellow.500' : 'blue.500'}
            >
              <CardBody>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">{alert.title}</Text>
                    <Text fontSize="sm" color="gray.600">
                      Area: {alert.area}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Type: {alert.type}
                    </Text>
                  </Box>
                  <Badge
                    colorScheme={alert.severity === 'critical' ? 'red' : 
                                alert.severity === 'high' ? 'orange' : 
                                alert.severity === 'medium' ? 'yellow' : 'blue'}
                  >
                    {alert.severity}
                  </Badge>
                </Flex>
              </CardBody>
            </Card>
          ))}
      </Box>

      {/* Alert Details and Management */}
      <Box>
        {selectedAlert ? (
          <Box>
            <Heading size="md" mb={4}>Alert Details</Heading>
            <Card mb={4}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Title</Text>
                    <Text>{selectedAlert.title}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Description</Text>
                    <Text>{selectedAlert.description}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Area</Text>
                    <Text>{selectedAlert.area}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Type</Text>
                    <Text>{selectedAlert.type}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Created At</Text>
                    <Text>{new Date(selectedAlert.createdAt).toLocaleString()}</Text>
                  </Box>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={alertStatus}
                      onChange={(e) => setAlertStatus(e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                      <option value="expired">Expired</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Update Notes</FormLabel>
                    <Textarea
                      value={alertNotes}
                      onChange={(e) => setAlertNotes(e.target.value)}
                      placeholder="Add notes about the alert update..."
                    />
                  </FormControl>
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      onUpdateAlert({
                        alertId: selectedAlert._id,
                        status: alertStatus,
                        notes: alertNotes
                      });
                      setAlertNotes('');
                      setSelectedAlert(null);
                    }}
                  >
                    Update Alert
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        ) : (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">Select an alert to view details</Text>
          </Box>
        )}
      </Box>
    </Grid>
  );
};

// Analytics Panel Component
const AnalyticsPanel = ({ reports, alerts }) => {
  // Calculate report statistics
  const reportStats = {
    byStatus: {
      pending: reports?.filter(r => r.verificationStatus === 'pending').length || 0,
      verified: reports?.filter(r => r.verificationStatus === 'verified').length || 0,
      disputed: reports?.filter(r => r.verificationStatus === 'disputed').length || 0
    },
    bySeverity: {
      critical: reports?.filter(r => r.severity === 'critical').length || 0,
      high: reports?.filter(r => r.severity === 'high').length || 0,
      medium: reports?.filter(r => r.severity === 'medium').length || 0,
      low: reports?.filter(r => r.severity === 'low').length || 0
    }
  };

  // Calculate alert statistics
  const alertStats = {
    byStatus: {
      active: alerts?.filter(a => a.status === 'active').length || 0,
      resolved: alerts?.filter(a => a.status === 'resolved').length || 0,
      expired: alerts?.filter(a => a.status === 'expired').length || 0
    },
    bySeverity: {
      critical: alerts?.filter(a => a.severity === 'critical').length || 0,
      high: alerts?.filter(a => a.severity === 'high').length || 0,
      medium: alerts?.filter(a => a.severity === 'medium').length || 0,
      low: alerts?.filter(a => a.severity === 'low').length || 0
    }
  };

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={8}>
      {/* Report Analytics */}
      <Box>
        <Heading size="md" mb={6}>Report Analytics</Heading>
        
        <Card mb={6}>
          <CardBody>
            <Heading size="sm" mb={4}>Reports by Status</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              <Box textAlign="center" p={4} bg="yellow.100" borderRadius="md">
                <Text fontSize="2xl" fontWeight="bold" color="yellow.700">
                  {reportStats.byStatus.pending}
                </Text>
                <Text color="yellow.700">Pending</Text>
              </Box>
              <Box textAlign="center" p={4} bg="green.100" borderRadius="md">
                <Text fontSize="2xl" fontWeight="bold" color="green.700">
                  {reportStats.byStatus.verified}
                </Text>
                <Text color="green.700">Verified</Text>
              </Box>
              <Box textAlign="center" p={4} bg="red.100" borderRadius="md">
                <Text fontSize="2xl" fontWeight="bold" color="red.700">
                  {reportStats.byStatus.disputed}
                </Text>
                <Text color="red.700">Disputed</Text>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>Reports by Severity</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {Object.entries(reportStats.bySeverity).map(([severity, count]) => (
                <Box
                  key={severity}
                  textAlign="center"
                  p={4}
                  bg={severity === 'critical' ? 'red.100' :
                      severity === 'high' ? 'orange.100' :
                      severity === 'medium' ? 'yellow.100' : 'blue.100'}
                  borderRadius="md"
                >
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={severity === 'critical' ? 'red.700' :
                           severity === 'high' ? 'orange.700' :
                           severity === 'medium' ? 'yellow.700' : 'blue.700'}
                  >
                    {count}
                  </Text>
                  <Text
                    color={severity === 'critical' ? 'red.700' :
                           severity === 'high' ? 'orange.700' :
                           severity === 'medium' ? 'yellow.700' : 'blue.700'}
                    textTransform="capitalize"
                  >
                    {severity}
                  </Text>
                </Box>
              ))}
            </Grid>
          </CardBody>
        </Card>
      </Box>

      {/* Alert Analytics */}
      <Box>
        <Heading size="md" mb={6}>Alert Analytics</Heading>
        
        <Card mb={6}>
          <CardBody>
            <Heading size="sm" mb={4}>Alerts by Status</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              <Box textAlign="center" p={4} bg="blue.100" borderRadius="md">
                <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                  {alertStats.byStatus.active}
                </Text>
                <Text color="blue.700">Active</Text>
              </Box>
              <Box textAlign="center" p={4} bg="green.100" borderRadius="md">
                <Text fontSize="2xl" fontWeight="bold" color="green.700">
                  {alertStats.byStatus.resolved}
                </Text>
                <Text color="green.700">Resolved</Text>
              </Box>
              <Box textAlign="center" p={4} bg="gray.100" borderRadius="md">
                <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  {alertStats.byStatus.expired}
                </Text>
                <Text color="gray.700">Expired</Text>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>Alerts by Severity</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {Object.entries(alertStats.bySeverity).map(([severity, count]) => (
                <Box
                  key={severity}
                  textAlign="center"
                  p={4}
                  bg={severity === 'critical' ? 'red.100' :
                      severity === 'high' ? 'orange.100' :
                      severity === 'medium' ? 'yellow.100' : 'blue.100'}
                  borderRadius="md"
                >
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={severity === 'critical' ? 'red.700' :
                           severity === 'high' ? 'orange.700' :
                           severity === 'medium' ? 'yellow.700' : 'blue.700'}
                  >
                    {count}
                  </Text>
                  <Text
                    color={severity === 'critical' ? 'red.700' :
                           severity === 'high' ? 'orange.700' :
                           severity === 'medium' ? 'yellow.700' : 'blue.700'}
                    textTransform="capitalize"
                  >
                    {severity}
                  </Text>
                </Box>
              ))}
            </Grid>
          </CardBody>
        </Card>
      </Box>
    </Grid>
  );
};

export default MunicipalityDashboard;