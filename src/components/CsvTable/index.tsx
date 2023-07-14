import React, { useEffect, useState, useRef } from 'react';
import { Table } from 'antd';

interface CSVTableProps {
  csvData: string;
}

const CSVTable: React.FC<CSVTableProps> = ({ csvData }) => {
  const [data, setData] = useState<object[]>([]);
  const headersRef = useRef<string[]>([]);

  useEffect(() => {
    const rows = csvData.trim().split('\n');
    const headers = rows[0].split(',').map(header => header.trim());
    headersRef.current = headers; // 更新引用的值
    const parsedData = rows.slice(1).map(row => {
      const values = row.split(',').map(cell => cell.trim());
      const rowData: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });
      return rowData;
    });
    setData(parsedData);
  }, [csvData]);

  const columns = headersRef.current.map(header => ({
    title: header,
    dataIndex: header,
    key: header,
  }));

  return <Table dataSource={data} columns={columns} />;
};

export default CSVTable;
