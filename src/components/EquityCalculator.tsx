import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EquityPDFReport from './EquityPDFReport';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface ChartDataItem {
  name: string;
  value: number;
}

interface Member {
  role: string;
  name: string;
  points: {
    commitment: number;
    expertise: number;
    risk: number;
    responsibilities: number;
  };
  multiplier: number;
  notes: string;
}

interface VestingSchedule {
  years: number;
  cliff: number;
}

interface CustomPointsCategory {
  name: string;
  points: number;
}

interface SavedScenario {
  name: string;
  date: string;
  members: Member[];
  optionPool: number;
  vestingSchedule: VestingSchedule;
  customPointsCategories: CustomPointsCategory[];
  futureFunding: number;
  chartData: ChartDataItem[];
}

const EquityCalculator = () => {
  const [members, setMembers] = useState<Member[]>([
    { 
      role: 'CEO', 
      name: 'Akram Hidri', 
      points: { commitment: 25, expertise: 20, risk: 10, responsibilities: 8 }, 
      multiplier: 1,
      notes: ''
    },
    { 
      role: 'CTO', 
      name: 'Iadh Hamdi', 
      points: { commitment: 25, expertise: 20, risk: 10, responsibilities: 8 }, 
      multiplier: 1,
      notes: ''
    }
  ]);
  
  const [optionPool, setOptionPool] = useState(10);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('Default Scenario');
  const [vestingSchedule, setVestingSchedule] = useState<VestingSchedule>({ years: 4, cliff: 1 });
  const [customPointsCategories, setCustomPointsCategories] = useState<CustomPointsCategory[]>([]);
  const [futureFunding, setFutureFunding] = useState(0);
  const [startupName, setStartupName] = useState('');
  const [startupDescription, setStartupDescription] = useState('');
  const [yearOfFunding, setYearOfFunding] = useState('');
  const [fundingStage, setFundingStage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const calculateEquity = useCallback(() => {
    const totalPoints = members.reduce((sum, member) => {
      const memberPoints = Object.values(member.points).reduce((a, b) => a + b, 0) * member.multiplier;
      return sum + memberPoints;
    }, 0);

    const remainingEquity = 100 - optionPool;
    
    const newChartData = members.map(member => {
      const memberPoints = Object.values(member.points).reduce((a, b) => a + b, 0) * member.multiplier;
      const equity = (memberPoints / totalPoints) * remainingEquity;
      return {
        name: member.role,
        value: parseFloat(equity.toFixed(2))
      };
    });

    newChartData.push({
      name: 'Option Pool',
      value: optionPool
    });

    setChartData(newChartData);
  }, [members, optionPool]);

  useEffect(() => {
    calculateEquity();
  }, [calculateEquity]);

  const exportToCSV = () => {
    const headers = ['Role', 'Name', 'Equity %', 'Points', 'Multiplier', 'Notes'];
    const rows = chartData.map(item => {
      const member = members.find(m => m.role === item.name) || { name: '', points: {}, multiplier: 1, notes: '' };
      const points = member.points ? Object.values(member.points).reduce((a, b) => a + b, 0) : 0;
      return [
        item.name,
        member.name,
        item.value,
        points,
        member.multiplier,
        member.notes
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equity_split_${scenarioName.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url); // Clean up the URL object
  };

  const saveScenario = () => {
    const newScenario: SavedScenario = {
      name: scenarioName,
      date: new Date().toISOString(),
      members: [...members],
      optionPool,
      vestingSchedule,
      customPointsCategories,
      futureFunding,
      chartData: [...chartData]
    };

    setSavedScenarios([...savedScenarios, newScenario]);
  };

  const loadScenario = (scenario: SavedScenario) => {
    setMembers(scenario.members);
    setOptionPool(scenario.optionPool);
    setVestingSchedule(scenario.vestingSchedule);
    setCustomPointsCategories(scenario.customPointsCategories);
    setFutureFunding(scenario.futureFunding);
    setScenarioName(scenario.name);
    setChartData(scenario.chartData);
  };

  const copyToClipboard = () => {
    const textData = chartData.map(item => 
      `${item.name}: ${item.value}%`
    ).join('\n');
    
    navigator.clipboard.writeText(textData);
  };

  const addCustomPointCategory = () => {
    setCustomPointsCategories([...customPointsCategories, { name: '', points: 0 }]);
  };

  const calculateDilutionImpact = () => {
    const totalEquity = 100;
    const newTotalEquity = totalEquity + futureFunding;
    const dilutionFactor = totalEquity / newTotalEquity;

    const dilutedChartData = chartData.map(item => ({
      ...item,
      value: parseFloat((item.value * dilutionFactor).toFixed(2))
    }));

    setChartData(dilutedChartData);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Startup Equity Split Calculator by Akram</h1>
        <p className="text-gray-600">Calculate fair equity distribution based on member contributions and responsibilities. This tool helps startups make informed decisions about equity allocation.</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="mt-2 p-2 border rounded text-gray-900"
            placeholder="Scenario Name"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          {isClient && (
            <PDFDownloadLink
              document={
                <EquityPDFReport
                  scenarioName={scenarioName}
                  members={members}
                  chartData={chartData}
                  optionPool={optionPool}
                  startupName={startupName}
                  startupDescription={startupDescription}
                  yearOfFunding={yearOfFunding}
                  fundingStage={fundingStage}
                  logoUrl={logoUrl}
                />
              }
              fileName={`equity_split_${scenarioName.replace(/\s+/g, '_')}.pdf`}
            >
              {({ loading }) =>
                loading ? 'Loading document...' : (
                  <button
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Export PDF
                  </button>
                )
              }
            </PDFDownloadLink>
          )}
          <button
            onClick={saveScenario}
            className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Save Scenario
          </button>
          <button
            onClick={copyToClipboard}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Copy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="mb-4">
            <label className="block mb-2 text-lg font-medium text-gray-900">Option Pool (%)</label>
            <p className="text-gray-600 mb-2 text-sm">Reserved equity for future hires, advisors, and incentives. Typically ranges from 10-20% of total equity.</p>
            <input
              type="number"
              value={optionPool}
              onChange={(e) => setOptionPool(Number(e.target.value))}
              className="w-full p-2 border rounded text-gray-900"
              min="0"
              max="100"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-lg font-medium text-gray-900">Vesting Schedule</label>
            <p className="text-gray-600 mb-2 text-sm">Specify the vesting schedule for equity distribution.</p>
            <div className="flex gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-900">Years</label>
                <input
                  type="number"
                  value={vestingSchedule.years}
                  onChange={(e) => setVestingSchedule({ ...vestingSchedule, years: Number(e.target.value) })}
                  className="w-full p-2 border rounded text-gray-900"
                  min="1"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-900">Cliff (Years)</label>
                <input
                  type="number"
                  value={vestingSchedule.cliff}
                  onChange={(e) => setVestingSchedule({ ...vestingSchedule, cliff: Number(e.target.value) })}
                  className="w-full p-2 border rounded text-gray-900"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-lg font-medium text-gray-900">Future Funding (%)</label>
            <p className="text-gray-600 mb-2 text-sm">Impact of future funding rounds on current equity distribution.</p>
            <input
              type="number"
              value={futureFunding}
              onChange={(e) => setFutureFunding(Number(e.target.value))}
              className="w-full p-2 border rounded text-gray-900"
              min="0"
              max="100"
            />
            <button
              onClick={calculateDilutionImpact}
              className="w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mt-2"
            >
              Calculate Dilution Impact
            </button>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-lg font-medium text-gray-900">Custom Points Categories</label>
            <p className="text-gray-600 mb-2 text-sm">Add custom categories for points allocation.</p>
            {customPointsCategories.map((category, index) => (
              <div key={index} className="flex gap-4 mb-2">
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => {
                    const newCategories = [...customPointsCategories];
                    newCategories[index].name = e.target.value;
                    setCustomPointsCategories(newCategories);
                  }}
                  className="w-1/2 p-2 border rounded text-gray-900"
                  placeholder="Category Name"
                />
                <input
                  type="number"
                  value={category.points}
                  onChange={(e) => {
                    const newCategories = [...customPointsCategories];
                    newCategories[index].points = parseInt(e.target.value) || 0;
                    setCustomPointsCategories(newCategories);
                  }}
                  className="w-1/2 p-2 border rounded text-gray-900"
                  placeholder="Points"
                />
              </div>
            ))}
            <button
              onClick={addCustomPointCategory}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Custom Category
            </button>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-lg font-medium text-gray-900">Startup Information</label>
            <p className="text-gray-600 mb-2 text-sm">Provide details about the startup.</p>
            <input
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              placeholder="Startup Name"
            />
            <textarea
              value={startupDescription}
              onChange={(e) => setStartupDescription(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 mt-2"
              placeholder="Startup Description"
              rows={2}
            />
            <input
              type="text"
              value={yearOfFunding}
              onChange={(e) => setYearOfFunding(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 mt-2"
              placeholder="Year of Funding"
            />
            <input
              type="text"
              value={fundingStage}
              onChange={(e) => setFundingStage(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 mt-2"
              placeholder="Funding Stage"
            />
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 mt-2"
              placeholder="Logo URL"
            />
          </div>

          {members.map((member, index) => (
            <div key={index} className="p-6 border rounded-lg bg-white shadow-sm">
              <div className="flex justify-between mb-4">
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => {
                    const newMembers = [...members];
                    newMembers[index].role = e.target.value;
                    setMembers(newMembers);
                  }}
                  className="w-1/2 p-2 border rounded font-semibold text-gray-900"
                  placeholder="Role/Title"
                />
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => {
                    const newMembers = [...members];
                    newMembers[index].name = e.target.value;
                    setMembers(newMembers);
                  }}
                  className="w-1/2 ml-2 p-2 border rounded text-gray-900"
                  placeholder="Name"
                />
                <button
                  onClick={() => {
                    const newMembers = members.filter((_, i) => i !== index);
                    setMembers(newMembers);
                  }}
                  className="ml-2 p-2 text-red-500 hover:text-red-600"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900">Time Commitment (0-30)</label>
                  <p className="text-gray-600 mb-2 text-sm">Full-time (30 points), part-time (15 points), or advisory (5-10 points) commitment to the startup.</p>
                  <input
                    type="number"
                    value={member.points.commitment}
                    onChange={(e) => {
                      const newMembers = [...members];
                      newMembers[index].points.commitment = parseInt(e.target.value) || 0;
                      setMembers(newMembers);
                    }}
                    className="w-full p-2 border rounded text-gray-900"
                    min="0"
                    max="30"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-900">Expertise (0-25)</label>
                  <p className="text-gray-600 mb-2 text-sm">Relevant skills, experience, and domain expertise brought to the company.</p>
                  <input
                    type="number"
                    value={member.points.expertise}
                    onChange={(e) => {
                      const newMembers = [...members];
                      newMembers[index].points.expertise = parseInt(e.target.value) || 0;
                      setMembers(newMembers);
                    }}
                    className="w-full p-2 border rounded text-gray-900"
                    min="0"
                    max="25"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-900">Risk/Capital (0-15)</label>
                  <p className="text-gray-600 mb-2 text-sm">Financial investment and personal risk taken in joining the startup.</p>
                  <input
                    type="number"
                    value={member.points.risk}
                    onChange={(e) => {
                      const newMembers = [...members];
                      newMembers[index].points.risk = parseInt(e.target.value) || 0;
                      setMembers(newMembers);
                    }}
                    className="w-full p-2 border rounded text-gray-900"
                    min="0"
                    max="15"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-900">Responsibilities (0-10)</label>
                  <p className="text-gray-600 mb-2 text-sm">Level of leadership and decision-making responsibilities within the company.</p>
                  <input
                    type="number"
                    value={member.points.responsibilities}
                    onChange={(e) => {
                      const newMembers = [...members];
                      newMembers[index].points.responsibilities = parseInt(e.target.value) || 0;
                      setMembers(newMembers);
                    }}
                    className="w-full p-2 border rounded text-gray-900"
                    min="0"
                    max="10"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1 font-medium text-gray-900">Multiplier</label>
                  <p className="text-gray-600 mb-2 text-sm">Adjustment factor for special circumstances (e.g., 1.5x for founding members, 0.8x for late joiners).</p>
                  <input
                    type="number"
                    value={member.multiplier}
                    onChange={(e) => {
                      const newMembers = [...members];
                      newMembers[index].multiplier = parseFloat(e.target.value) || 1;
                      setMembers(newMembers);
                    }}
                    className="w-full p-2 border rounded text-gray-900"
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1 font-medium text-gray-900">Notes</label>
                  <p className="text-gray-600 mb-2 text-sm">Additional context or justification for equity allocation.</p>
                  <textarea
                    value={member.notes}
                    onChange={(e) => {
                      const newMembers = [...members];
                      newMembers[index].notes = e.target.value;
                      setMembers(newMembers);
                    }}
                    className="w-full p-2 border rounded text-gray-900"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setMembers([...members, {
              role: `Team Member ${members.length + 1}`,
              name: '',
              points: { commitment: 0, expertise: 0, risk: 0, responsibilities: 0 },
              multiplier: 1,
              notes: ''
            }])}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Team Member
          </button>
        </div>

        <div>
          <div className="h-96 bg-white p-4 rounded-lg shadow-sm" id="equity-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm" id="equity-distribution">
            <h3 className="font-bold mb-4 text-gray-900">Equity Distribution</h3>
            <div className="space-y-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                    {members.find(m => m.role === item.name)?.name && (
                      <span className="text-gray-500 ml-2">
                        ({members.find(m => m.role === item.name)?.name})
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {savedScenarios.length > 0 && (
            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold mb-4 text-gray-900">Saved Scenarios</h3>
              <ul>
                {savedScenarios.map((scenario, index) => (
                  <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <span className="font-medium text-gray-900">{scenario.name}</span>
                    <div>
                      <button
                        onClick={() => loadScenario(scenario)}
                        className="p-2 text-blue-500 hover:text-blue-600"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          const newScenarios = savedScenarios.filter((_, i) => i !== index);
                          setSavedScenarios(newScenarios);
                        }}
                        className="ml-2 p-2 text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {savedScenarios.length > 1 && (
            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold mb-4 text-gray-900">Scenario Comparison</h3>
              <div className="space-y-4">
                {savedScenarios.map((scenario, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                    <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                    <div className="space-y-2">
                      {scenario.chartData.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                          <div>
                            <span className="font-medium text-gray-900">{item.name}</span>
                            {scenario.members.find(m => m.role === item.name)?.name && (
                              <span className="text-gray-500 ml-2">
                                ({scenario.members.find(m => m.role === item.name)?.name})
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-gray-900">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquityCalculator;