import {
  listMyChartByPageUsingPOST,
  deleteChartUsingPOST,
  genChartByAiAsyncMqRetryUsingPOST
} from '@/services/yubi/chartController';
import {useModel} from '@@/exports';
import {Avatar, Button, Card, Collapse, List, message, Popconfirm, Result, Space} from 'antd';
import ReactECharts from 'echarts-for-react';
import React, {useEffect, useState} from 'react';
import Search from "antd/es/input/Search";
import { history } from '@umijs/max';

/**
 * 我的图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({...initSearchParams});
  const {initialState} = useModel('@@initialState');
  const {currentUser} = initialState ?? {};
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 隐藏图表的 title
        if (res.data.records) {
          res.data.records.forEach(data => {
            if (data.status === 'succeed') {
              const chartOption = JSON.parse(data.genChart ?? '{}');
              chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
            }
          })
        }
      } else {
        message.error('获取我的图表失败');
      }
    } catch (e: any) {
      message.error('获取我的图表失败，' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const toDetails = (id: number) => {
    // 取出当前图表
    chartList?.forEach(chart => {
      if (chart.id === id) {
        history.push(`/chart_detail/${id}`, chart);
      }
    })
    // history.push(`/chart_detail/${id}`);
  }

  const deleteChart = async (id: number) => {
    await deleteChartUsingPOST({id: id}).then(res => {
      if (res.data) {
        message.success('删除成功');
        loadData();
      } else {
        message.error('删除失败');
      }
    })
  }

  const retryChart = async (id: number) => {
    await genChartByAiAsyncMqRetryUsingPOST({id: id}).then(res => {
      if (res.data) {
        message.success('提交成功');
        loadData();
      } else {
        message.error('提交失败');
      }
    })
  }

  return (
    <div className="my-chart-page">
      <div>
        <Search placeholder="请输入图表名称" enterButton loading={loading} onSearch={(value) => {
          // 设置搜索条件
          setSearchParams({
            ...initSearchParams,
            name: value,
          })
        }}/>
      </div>
      <div className="margin-16"/>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            })
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{width: '100%'}}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAvatar}/>}
                title={item.name}
                description={item.chartType ? '图表类型：' + item.chartType : undefined}
              />
              <>
                {
                  item.status === 'wait' && <>
                    <Result
                      status="warning"
                      title="待生成"
                      subTitle={item.execMessage ?? '当前图表生成队列繁忙，请耐心等候'}
                    />
                  </>
                }
                {
                  item.status === 'running' && <>
                    <Result
                      status="info"
                      title="图表生成中"
                      subTitle={item.execMessage}
                    />
                  </>
                }
                {
                  item.status === 'succeed' && <>
                    <div style={{marginBottom: 16}}/>
                    <p>{'分析目标：' + item.goal}
                      <Popconfirm
                        title="你确定要删除吗？"
                        description="删除后将无法恢复"
                        onConfirm={() => {
                          deleteChart(item.id ?? 0)
                        }}
                      >
                        <Button
                          type="link" danger size="small" style={{float: "right"}}>删除</Button>
                      </Popconfirm>
                      <Button
                        onClick={() => {
                          toDetails(item.id ?? 0)
                        }}
                        type="link" size="small" style={{float: "right"}}>分析详情</Button>
                    </p>
                    <p><Collapse accordion items={[{
                      label: '分析结果',
                      children: <pre style={{ whiteSpace: 'pre-wrap' }}>{item.genResult}</pre>,
                    }]}/></p>
                    <div style={{marginBottom: 16}}/>
                    <ReactECharts option={item.genChart && JSON.parse(item.genChart)}/>
                  </>
                }
                {
                  item.status === 'failed' && <>
                    <Result
                      status="error"
                      title="图表生成失败"
                      subTitle={item.execMessage}
                    />
                    <Space style={{display: 'flex', justifyContent: 'center'}}>
                      <Button type="primary" onClick={() => {
                        retryChart(item.id ?? 0)
                      }}>重新生成</Button>
                      <Popconfirm
                        title="你确定要删除吗？"
                        description="删除后将无法恢复"
                        onConfirm={() => {
                          deleteChart(item.id ?? 0)
                        }}
                      >
                        <Button type="primary" danger>删除</Button>
                      </Popconfirm>
                    </Space>
                  </>
                }
              </>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;
